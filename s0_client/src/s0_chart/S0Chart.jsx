import React, {useCallback, useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {
    AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {DateTimeFormatter, Instant, LocalDateTime, ZoneId, ZoneOffset} from "@js-joda/core";
import { dropLastWhile, splitEvery, sum } from 'ramda';

const dateTimeFormat = DateTimeFormatter.ofPattern('dd.MM.yyyy HH:mm')
const flatS0DateFormat = DateTimeFormatter.ofPattern("yyyy/MM/dd'T'HH")

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
                    val: parseInt(power || "0") * powerFactor,
                }));
        })
        .flat();
    if (minutes_aggregate > 1) {
        return splitEvery(minutes_aggregate, enhancedData)
            .map(
                (aggregate) => ({
                    es: aggregate[0].es,
                    val: sum(aggregate.map((i) => i.val)),
                }));
    }
    return enhancedData;
}

const S0Chart = ({ s0_server_url, width, height, hours, minutes_aggregate}) => {
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

    useMemo(() => {
        setData(enhanceFlatS0Data(flatData, minutes_aggregate));
    }, [flatData, minutes_aggregate]);

    const tooltipFormatter = useCallback(
        (power) => ([`${power} Watt` ])
    , [])

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <ResponsiveContainer>
                <AreaChart
                        width={width}
                        height={height}
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
                        label="Watt"
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip labelFormatter={formatDateTime} formatter={tooltipFormatter} />
                    <Area dataKey="val" type="monotone"  stroke="#C41E3A" fill="#D22B2B" />
                </AreaChart>
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
    width: 800,
    height: 600,
    hours: 24,
    minutes_aggregate: 1
};
export default S0Chart;
