import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ExcelReader() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const jsonData = XLSX.utils.sheet_to_json(ws);
            console.log(jsonData)
            let renamedData = renameFields(jsonData);
            
             renamedData = renamedData.slice(1);
            setData(renamedData);
           
            const temp = renamedData.map((x)=>{

                const TranType = x["TRAN TYPE"]
                const SrcAmount = x["SRC AMOUNT"]
                const AuthCD = x["AUTH CD"]
                const CommRate = x["COMM RATE"]
                // billed amt * comm rate / 100
                const CommAmt = Number(SrcAmount) * Number(CommRate) / 100
                // vat amt = comm amt * 5 / 100
                const VatAmt = CommAmt * 5 / 100
                const AmountPayable = SrcAmount - CommAmt - VatAmt
                // payable amt = billed amt - comm amt - vat amt
                let y = {Date:x.DATE,Time:x.TIME,TranType,Card:x.CARD,BilledAmount:SrcAmount,AuthCD,CommRate,CommAmt,VatAmt,AmountPayable}
                return y
            })
            setFilteredData(temp)
         
            const formatDate = formatAndModifyDate(temp)
            setFilteredData(formatDate)
            // console.log(formatDate)
            // console.log("temp aboe")
        };

        reader.readAsArrayBuffer(file);
    };

    function renameFields(data) {
        if (data.length === 0) return [];
    
        const newFieldNames = [
            "DATE", "POST NO", "TIME", "DH", "MERCH ID", "BATCH", "SEQ", 
            "TRAN TYPE", "CARD", "AUTH CD", "CARD ISSUER", "CAPTURE TYPE", 
            "PROD TYPE", "REGION", "COMM RATE", "SRC AMOUNT", "AMOUNT", "CRNCY", 
            "COMM AMNT", "COMM CRNCY", "VAT AMT", "VAT CRNCY", "LOY NAME", "LOY RATE", 
            "LOY AMNT", "LOY CRNCY", "LOY NAME1", "LOY RATE1", "LOY AMNT1", 
            "LOY CRNCY1", "LOY NAME2", "LOY RATE2", "LOY AMNT2", "LOY CRNCY2", 
            "STTL AMNT", "STTL CRNCY", "DCC AMNT", "DCC CRNCY", "REFERENCE", "DESC 1", 
            "DESC 2", "DESC 3", "EPP AMNT", "EPP CRNCY", "ARN REFNO", "PEND INDICATOR", 
            "ACCOUNT ID", "REFERENCE ID", "REFERENCE NUM", "FLAT FEE ON TRANSACTION", 
            "VAT-FLAT FEE ON TRANSACTION", "TRANX DATE", "ARN"
        ];
    
        const oldKeys = Object.keys(data[0]);
    
        return data.map(item => {
            const newItem = {};
            oldKeys.forEach((key, index) => {
                if (newFieldNames[index]) { 
                    newItem[newFieldNames[index]] = item[key];
                }
            });
            return newItem;
        });
    }


    function formatAndModifyDate(dataArray) {
        return dataArray.map(item => {
            let { Date } = item;

            // console.log(item)
            // Convert to string and check length
            let dateString = Date + '';
            if (dateString.length === 3) {
                dateString = '0' + dateString;  // Add zero at the start if it's a three-digit number
            }
            
            // Rearrange the digits: swap the first two digits to the end and add '24'
            dateString = dateString.substring(2) + dateString.substring(0, 2) + '24';
            // Insert slashes: MM/DD/YYYY format
            dateString = dateString.substring(0, 2) + '/' + dateString.substring(2, 4) + '/' + dateString.substring(4);
    
            // Update the item with the new Date and return it
            return { ...item, Date: dateString };
        });
    }

   


    return (
        <div className="container mx-auto p-4">
            
            <div className="flex flex-col items-center justify-center border-dashed border-4 border-gray-200 p-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Upload Excel File
                    <input type="file"
                           onChange={handleFileChange}
                           className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-violet-50 file:text-violet-700
                                      hover:file:bg-violet-100 mt-2"
                            />
                </label>
            </div>
            {data.length > 0 && (
                <>
                    <div className="overflow-x-auto mt-6">
                        <h2 className="text-lg font-semibold">Full Data</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(data[0]).map((key, index) => (
                                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="overflow-x-auto mt-6">
                        <h2 className="text-lg font-semibold">Filtered Data</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(filteredData[0]).map((key, index) => (
                                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ExcelReader;
