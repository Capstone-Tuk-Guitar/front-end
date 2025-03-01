import React from "react";
import { Pie } from "react-chartjs-2";
import styles from "../styles/PieChart.module.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ title, value, color }) => {
    const chartData = {
        labels: [],
        datasets: [
            {
                data: [value * 100, 100 - value * 100],
                backgroundColor: [color, "#DDDDDD"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        cutout: "0%",
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `${tooltipItem.raw.toFixed(1)}%`,
                },
            },
        },
    };

    return (
        <div className={styles.chart}>
            <h3 className={styles.chart_title}>{title}</h3>
            <Pie data={chartData} options={chartOptions} />
            <p className={styles.chart_percentage}>{(value * 100).toFixed(1)}%</p>
        </div>
    );
};

export default PieChart;
