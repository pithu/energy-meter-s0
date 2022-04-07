import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {DateTimeFormatter, Instant, LocalDate, ZoneId, ZoneOffset} from "@js-joda/core";
import { dropLastWhile, splitEvery, sum } from 'ramda';

const dateTimeFormat = DateTimeFormatter.ofPattern('dd.MM.yyyy HH:mm')
const s0DateFormat = DateTimeFormatter.ofPattern('yyyy/MM/dd')

const formatDateTime = (es) =>
    Instant.ofEpochSecond(es).atZone(ZoneId.systemDefault()).toLocalDateTime().format(dateTimeFormat)

const mapS0LogData = (s0LogData, minutes_aggregate) => {
    let data = [];
    // map to epoch second items FIXME time zone
    for (const dateString of Object.keys(s0LogData).sort()) {
        const localDateTime = LocalDate.parse(dateString, s0DateFormat).atStartOfDay();
        for (const hourString of Object.keys(s0LogData[dateString]).sort()) {
            const hour = parseInt(hourString);
            const localDateTimeAtHour = localDateTime.plusHours(hour);
            const minuteValues = s0LogData[dateString][hourString]
                .map((power, idx) => ({
                    es: localDateTimeAtHour
                        .plusMinutes(idx)
                        .toEpochSecond(ZoneOffset.UTC),
                    val: power != null ? parseInt(power) : null,
                }))
            data.push(...minuteValues);
        }
    }
    // filter trailing empty values
    data = dropLastWhile((item) => item.val == null, data);
    // aggregate minutes
    if (minutes_aggregate > 1) {
        data = splitEvery(minutes_aggregate, data)
            .map(
                (aggregate) => ({
                    es: aggregate[0].es,
                    val: sum(aggregate.map((i) => i.val)),
                }));
    }
    return data;
}

const S0Chart = ({ s0_server_url, width, height, hours, minutes_aggregate}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${s0_server_url}/s0-logs/${hours}`);
            const s0LogData = await response.json();
            const data = mapS0LogData(s0LogData, minutes_aggregate);
            setData(data);
        }
        fetchData().catch(console.error);
    }, [s0_server_url, hours, minutes_aggregate])

    const tooltipFormatter = (power) => {
        return [`${power} Watt/h per ${minutes_aggregate} min` ];
    }

    return (
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
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip labelFormatter={formatDateTime} formatter={tooltipFormatter} />
            <Area dataKey="val" type="monotone"  stroke="#C41E3A" fill="#D22B2B" />
        </AreaChart>
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
