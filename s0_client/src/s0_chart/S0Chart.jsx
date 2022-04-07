import React, {useEffect, useState} from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DateTimeFormatter, LocalDate, LocalDateTime, ZoneOffset } from "@js-joda/core";

const dateTimeFormat = DateTimeFormatter.ofPattern('dd.MM.yyyy HH:mm')
const s0DateFormat = DateTimeFormatter.ofPattern('yyyy/MM/dd')

const formatDateTime = (epochSeconds) =>
    LocalDateTime.ofEpochSecond(epochSeconds, ZoneOffset.UTC).format(dateTimeFormat)

const tooltipFormatter = (power) => {
    return [`${power} Watt/h` ];
}
const mapS0LogData = (s0LogData) => {
    const data = [];
    for (const dateString of Object.keys(s0LogData).sort()) {
        const dayEpochSeconds = LocalDate.parse(dateString, s0DateFormat).atStartOfDay().toEpochSecond(ZoneOffset.UTC);
        for (const hourString of Object.keys(s0LogData[dateString]).sort()) {
            const hour = parseInt(hourString);
            const hourEpochSeconds = dayEpochSeconds + hour * 3600;
            const minuteValues = s0LogData[dateString][hourString].map((power, idx) => ({
                es: hourEpochSeconds + idx * 60,
                val: parseInt(power || "0"),
            }))
            data.push(...minuteValues);
        }
    }
    return data;
}

const S0Chart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:8080/s0-logs/24');
            const s0LogData = await response.json();
            const data = mapS0LogData(s0LogData);
            setData(data);
        }
        fetchData().catch(console.error);
    }, [])

    return (
        <AreaChart width={600} height={600} data={data}
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
            <Area dataKey="val" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
    )
}

export default S0Chart;
