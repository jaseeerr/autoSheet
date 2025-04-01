// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ExcelReader from './components/ExcelReader';
import DataTable from './components/DataTable';
import UploadPdf from './components/UploadPdf';

function HomePage() {
    const [data, setData] = useState([]);

    return (
        <div className="App">
            <ExcelReader onDataRead={setData} />
            {data.length > 0 && <DataTable data={data} />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pdf" element={<UploadPdf />} />
            </Routes>
        </Router>
    );
}

export default App;
