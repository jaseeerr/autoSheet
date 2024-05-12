import React, { useState } from 'react';
import ExcelReader from './components/ExcelReader';
import DataTable from './components/DataTable';

function App() {
    const [data, setData] = useState([]);

    return (
        <div className="App">
            <ExcelReader onDataRead={setData} />
            {data.length > 0 && <DataTable data={data} />}
        </div>
    );
}

export default App;
