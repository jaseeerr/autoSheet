import React from 'react';

function DataTable({ data }) {
    return (
        <table>
            <thead>
                <tr>
                    {data.length > 0 && Object.keys(data[0]).map(key => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {Object.values(row).map((val, idx) => <td key={idx}>{val}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default DataTable;
