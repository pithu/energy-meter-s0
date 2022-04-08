import React, {useCallback, useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {
     Area, CartesianGrid, ComposedChart, Label, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {DateTimeFormatter, Instant, LocalDateTime, ZoneId, ZoneOffset} from "@js-joda/core";
import { dropLastWhile, isEmpty, splitEvery, sum } from 'ramda';

const dateTimeFormat = DateTimeFormatter.ofPattern('dd.MM.yyyy HH:mm')
const flatS0DateFormat = DateTimeFormatter.ofPattern("yyyy/MM/dd'T'HH")

const updateInterval = 60 * 1000;

const formatDateTime = (es) =>
    Instant.ofEpochSecond(es).atZone(ZoneId.systemDefault()).toLocalDateTime().format(dateTimeFormat)

const flattenS0LogData = (s0LogData) => {
    const flatS0Log = {};
    for (const dateString of Object.keys(s0LogData).sort()) {
        for (const hourString of Object.keys(s0LogData[dateString]).sort()) {
            flatS0Log[`${dateString}T${hourString}`] =
                dropLastWhile((val) => val == null, s0LogData[dateString][hourString]);
        }
    }
    return flatS0Log;
}

const updateFlatData = (flatData, s0LogData) => {
    const flatS0LogData = flattenS0LogData(s0LogData);
    return {
        ...flatData,
        ...flatS0LogData,
    }
}

const verifyMinutesAggregate = (minutes_aggregate) => {
    if (!Number.isInteger(60 /minutes_aggregate)) {
        console.error(`Configuration error: prop minutes_aggregate '${minutes_aggregate}' must be a divisor of 60`)
    }
}

const enhanceFlatS0Data = (flatS0Data, minutes_aggregate) => {
    const powerFactor = 60 / minutes_aggregate;
    const enhancedData = Object
        .keys(flatS0Data)
        .sort()
        .map((dateString) => {
            const epochSecondsAtHour = LocalDateTime
                .parse(dateString, flatS0DateFormat)
                .toEpochSecond(ZoneOffset.UTC);
            return flatS0Data[dateString]
                .map((power, idx) => ({
                    es: epochSecondsAtHour + idx * 60,
                    val: parseInt(power || "0"),
                }));
        })
        .flat();

    let total = 0;
    return splitEvery(minutes_aggregate, enhancedData)
        .map(
            (aggregate) => {
                const val = sum(aggregate.map((i) => i.val));
                total += val;
                return {
                    es: aggregate[0].es, val: val * powerFactor, wh: total,
                }
            }
        );
}

const S0Chart = ({ s0_server_url, hours, minutes_aggregate}) => {
    const [flatData, setFlatData] = useState({});
    const [data, setData] = useState([]);

    verifyMinutesAggregate(minutes_aggregate);

    useEffect(() => {
        const fetchS0LogData = async () => {
            const response = await fetch(`${s0_server_url}/s0-logs/${hours}`);
            const s0LogData = await response.json();
            setFlatData(flattenS0LogData(s0LogData));
        }
        fetchS0LogData().catch(console.error);
    }, [s0_server_url, hours])

    useEffect(() => {
        const intervalId = setInterval(() => {
            const _updateFlatData = async () => {
                if (isEmpty(flatData)) { return; }
                const response = await fetch(`${s0_server_url}/s0-logs/2`);
                const s0LogData = await response.json();
                setFlatData(updateFlatData(flatData, s0LogData));
            }
            _updateFlatData().catch(console.error);
        }, updateInterval);
        return () => clearInterval(intervalId);
    }, [flatData, s0_server_url]);

    useMemo(() => {
        setData(enhanceFlatS0Data(flatData, minutes_aggregate));
    }, [flatData, minutes_aggregate]);

    const tooltipFormatter = useCallback(
        (value, key) => key === 'val' ? [`${value} W`] : [`${value} WH`]
    , [])

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <ResponsiveContainer>
                <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis
                        dataKey="es"
                        scale="time"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatDateTime}
                    />
                    <YAxis
                        dataKey="val"
                        type="number"
                        domain={[0, 'dataMax']}
                        yAxisId="left"
                    >
                        <Label
                            value='W'
                            position='outside'
                            angle={-90}
                        />
                    </YAxis>
                    <YAxis
                        dataKey="wh"
                        type="number"
                        domain={[0, 'dataMax']}
                        yAxisId="right"
                        orientation="right"
                    >
                        <Label
                            value='WH'
                            position='outside'
                            angle={-90}
                        />
                    </YAxis>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip labelFormatter={formatDateTime} formatter={tooltipFormatter} />
                    <Area
                        yAxisId="left" dataKey="val" type="monotone"  stroke="#C41E3A" fill="#D22B2B"
                    />
                    <Line
                        yAxisId="right" dataKey="wh" type="monotone" dot={false}  stroke="darkred" strokeWidth={2}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}

S0Chart.propTypes = {
    s0_server_url: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    hours: PropTypes.number,
    minutes_aggregate: PropTypes.number,
}

S0Chart.defaultProps = {
    s0_server_url: 'http://localhost:8080',
    hours: 24,
    minutes_aggregate: 1
};
export default S0Chart;
