import React, { useRef, useState,useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactPrint from "react-to-print";



function ExcelReader() {
    const ref = useRef();

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [totalComAmt,setTotalComAmt] = useState(0)
    const [totalVatAmt,setTotalVatAmt] = useState(0)
    const [totalPayable,setTotalPayable] = useState(0)
    const [heading,setHeading] = useState("HEADING")
    const [dltBtn,setDltBtn] = useState(true)
    const [finalList,setFinalList] = useState([])

    const downloadPdfDocument = async () => {
        const input = document.getElementById('table-to-pdf');
        const canvas = await html2canvas(input, {
            scale: 1, // You can adjust scale to get higher or lower resolution
            logging: true, // Helpful for debugging
            useCORS: true // If your table contains images from external sources
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'l',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
    
        // Calculate the number of pages needed to fit the canvas height
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = canvas.height;
    
        // Set initial position for the image top
        let position = 0;
    
        // Add new pages and split the image across these pages
        pdf.addImage(imgData, 'PNG', 0, position, canvas.width, canvas.height);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = position - pageHeight;  // Move position for next image part
            pdf.addPage(); // Add a new page
            pdf.addImage(imgData, 'PNG', 0, position, canvas.width, canvas.height);
            heightLeft -= pageHeight;
        }
    
        pdf.save('download.pdf');
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const jsonData = XLSX.utils.sheet_to_json(ws);
            let renamedData = renameFields(jsonData);
            
             renamedData = renamedData.slice(1);
            setData(renamedData);
           
            const temp = renamedData.map((x)=>{

                const Tran_Type = x["TRAN TYPE"]
                const SrcAmount = x["SRC AMOUNT"]
                const Auth_CD = x["AUTH CD"]
                const Comm_Rate = x["COMM RATE"]
                // billed amt * comm rate / 100
                const Comm_Amt = (Number(SrcAmount) * Number(Comm_Rate) / 100).toFixed(2);
                // vat amt = comm amt * 5 / 100
                const Vat_Amt = (Comm_Amt * 5 / 100).toFixed(2);
                const Amount_Payable = (SrcAmount - Comm_Amt - Vat_Amt).toFixed(2);
                // payable amt = billed amt - comm amt - vat amt
                let y = {Date:x.DATE,Time:x.TIME,Tran_Type,Card:x.CARD,Billed_Amount:SrcAmount,Auth_CD,Comm_Rate,Comm_Amt,Vat_Amt,Amount_Payable}
                return y
            })
            setFilteredData(temp)
         
            const formatDate = formatAndModifyDate(temp)
            const formateTime = formatAndModifyTime(formatDate)
            setFilteredData(formateTime)
            calculateTotals(finalList)
         
        };

        reader.readAsArrayBuffer(file);
    };

    function formatAndModifyTime(dataArray) {
        return dataArray.map(item => {
            let { Time } = item;
            let timeString = Time.toString();
    
            // Prepend zeros based on the length of the time string
            if (timeString.length === 3) {
                timeString = '0' + timeString;  // Add zero at the start if it's a three-digit number
            } else if (timeString.length === 2) {
                timeString = '00' + timeString; // Add two zeros at the start if it's a two-digit number
            }
            else if (timeString.length === 1) {
                timeString = '000' + timeString; // Add two zeros at the start if it's a two-digit number
            }
    
            // Insert colon to format as HH:MM
            timeString = timeString.substring(0, 2) + ':' + timeString.substring(2);
    
            // Update the item with the new Time and return it
            return { ...item, Time: timeString };
        });
    }

    function calculateTotals(transactions) {
        if(transactions.length==0)
            {
                transactions = filteredData
            }
            


        let totalCommAmt = 0;
        let totalVatAmt = 0;
        let totalAmountPayable = 0;
    
        transactions.forEach(transaction => {
            totalCommAmt += parseFloat(transaction.Comm_Amt);
            totalVatAmt += parseFloat(transaction.Vat_Amt);
            totalAmountPayable += parseFloat(transaction.Amount_Payable);
        });

        function formatDecimalWithoutRounding(number) {
            const strNumber = number.toString();
            const [integerPart, decimalPart] = strNumber.split(".");
            const truncatedDecimalPart = decimalPart ? decimalPart.slice(0, 2) : "00";
            return `${integerPart}.${truncatedDecimalPart}`;
        }

        // totalCommAmt = formatDecimalWithoutRounding(totalCommAmt);
        // totalVatAmt = formatDecimalWithoutRounding(totalVatAmt);
        // totalAmountPayable = formatDecimalWithoutRounding(totalAmountPayable);

       

        setTotalComAmt(totalCommAmt.toFixed(2))
        setTotalVatAmt(totalVatAmt.toFixed(2))
        setTotalPayable(totalAmountPayable.toFixed(2))
    
       
    }

    function renameFields(data) {
        if (data.length === 0) return [];
    
        const newFieldNames = [
            "MERCH ID", "POST NO", "DATE", "DH", "TIME", "BATCH", "SEQ", 
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

    useEffect(() => {
        calculateTotals(finalList);
        
    }, [finalList]);

   


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
            {data.length > 0  && (
                <>
                    {/* <div className="overflow-x-auto mt-6">
                        <h2 className="text-lg font-semibold">Full Data</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(data[0]).map((key, index) => (
                                        <th key={index} scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> */}


                          <span className='flex justify-center mt-2'>
                              <button onClick={()=>setDltBtn(!dltBtn)} className='bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md'>
                                Show/Hide ADD Button
                                </button>
                          </span>

                   <span className='flex justify-center mt-2'>
                   <label htmlFor="" className='mx-auto'>EDIT HEADING</label> <br />
                   </span>
                    <span className='flex justify-center'>
                      
                      <input type="text" value={heading} onChange={(e)=>setHeading(e.target.value)} className='mb-3 border-2 p-2 rounded-md' placeholder='SET HEADING' />
                      </span>
                    <span className=' justify-center w-full hidden '>

                   
                    <ReactPrint
        trigger={() => <button className='my-3 px-5 py-1 border rounded-md bg-blue-500 hover:bg-blue-600 cursor-pointer text-white' id="btn">Download PDF</button>}
        content={() => ref.current}
        documentTitle={`${heading}`}
      />
      
                    </span>
                    
                   
                              {/* <h2 className="text-lg font-semibold text-center underline mb-3">Filtered Data</h2> */}

                    <div className="overflow-x-auto mt-6 p-5" id="table-to-pdf" ref={ref}>
                  
                        {/* <button onClick={downloadPdfDocument}>Download as PDF</button> */}
                        <table className="min-w-full divide-y divide-gray-200" >
                            <thead className="bg-gray-50">
                            <tr>
                                        <th colSpan={10} scope="col" className="px-1 text-center  py-1 border-2 border-black text-md font-medium text-black uppercase tracking-wider">
                                       {heading}
                                        </th>
                                   
                                </tr>

                                <tr>
                                    {Object.keys(filteredData[0]).map((key, index) => (
                                        <th key={index} scope="col" className=" text-center  border-2 border-black text-md font-medium text-black  ">
                                            {key}
                                        </th>
                                    ))}
                                </tr>

                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* {filteredData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <td key={cellIndex} className=" border-2 border-b-2 border-black text-center  whitespace-nowrap text-md text-black">
                                                {cell}
                                            </td>
                                            
                                        ))}
                                    </tr>
                                ))} */}

{
                             filteredData.length >0 && filteredData.map((x)=>{
                                        return(
                                            <tr>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Date}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Time}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Tran_Type}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Card}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Billed_Amount}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Auth_CD}
                                                    {dltBtn && 
                                                      <button
                                                    //   onClick={()=>{
                                                      
                                                    //     setFinalList(prevArray => [...prevArray, x]);
                                                    //     calculateTotals(finalList)
                                                    //     const temp = filteredData.filter((x)=>x.Auth_CD!=filteredData.Auth_CD)
                                                    //     setFilteredData(temp)

                                                    //   }}
                                                    onClick={() => {
                                                        setFinalList(prevArray => [...prevArray, x]);
                                                        setFilteredData(prevFiltered => prevFiltered.filter(item => item.Auth_CD !== x.Auth_CD))
                                                      
                                                        
                                                       
                                                    }}
                                                      className='bg-green-500 ml-5 px-2 rounded-md text-white'>+</button> 
                                                    }
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Comm_Rate}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Comm_Amt}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Vat_Amt}
                                                </td>
                                                <td className='border-2 border-black text-center'>
                                                    {x.Amount_Payable}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }


                                <tr>
    <td colSpan="6" className='border-b-0'></td>
    <td className="py-1 border-2 border-black  text-center"><strong>TOTAL</strong></td>
    <td className="py-1 border-2 border-black text-center">
    {totalComAmt}
    </td>
    <td className="py-1 border-2 border-black text-center">{totalVatAmt}</td>
    <td className="py-1 border-2 border-black text-center">{totalPayable}</td>

</tr>
                            </tbody>
                        </table>
                    </div>
{/* 
                    <span className='flex justify-center mt-2'>
                              <button onClick={()=>setDltBtn(!dltBtn)} className='bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md'>
                                Show/Hide ADD Button
                                </button>
                          </span> */}

                   {finalList.length > 0 &&
                   <div className="overflow-x-auto mt-6 p-5" id="table-to-pdf" ref={ref}>
                  
                   {/* <button onClick={downloadPdfDocument}>Download as PDF</button> */}
                   <table className="min-w-full divide-y divide-gray-200" >
                       <thead className="bg-gray-50">
                       <tr>
                                   <th colSpan={10} scope="col" className="px-1 text-center  py-1 border-2 border-black text-md font-medium text-black uppercase tracking-wider">
                                  {heading}
                                   </th>
                              
                           </tr>

                           <tr>
                               {Object.keys(finalList[0]).map((key, index) => (
                                   <th key={index} scope="col" className=" text-center  border-2 border-black text-md font-medium text-black  ">
                                       {key}
                                   </th>
                               ))}
                           </tr>

                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                           {/* {filteredData.map((row, index) => (
                               <tr key={index}>
                                   {Object.values(row).map((cell, cellIndex) => (
                                       <td key={cellIndex} className=" border-2 border-b-2 border-black text-center  whitespace-nowrap text-md text-black">
                                           {cell}
                                       </td>
                                       
                                   ))}
                               </tr>
                           ))} */}

{
                               finalList.map((x)=>{
                                   return(
                                       <tr>
                                           <td className='border-2 border-black text-center'>
                                               {x.Date}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Time}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Tran_Type}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Card}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Billed_Amount}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Auth_CD}
                                               {/* {dltBtn && 
                                                 <button
                                                 onClick={() => {
                                                    setFinalList(prevArray => prevArray.filter(item => item.Auth_CD !== x.Auth_CD));
                                                
                                                }}
                                                 className='bg-red-500 ml-5 px-2 rounded-md text-white'>X</button> 
                                               } */}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Comm_Rate}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Comm_Amt}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Vat_Amt}
                                           </td>
                                           <td className='border-2 border-black text-center'>
                                               {x.Amount_Payable}
                                           </td>
                                       </tr>
                                   )
                               })
                           }


                           <tr>
<td colSpan="6" className='border-b-0'></td>
<td className="py-1 border-2 border-black  text-center"><strong>TOTAL</strong></td>
<td className="py-1 border-2 border-black text-center">
{totalComAmt}
</td>
<td className="py-1 border-2 border-black text-center">{totalVatAmt}</td>
<td className="py-1 border-2 border-black text-center">{totalPayable}</td>

</tr>
                       </tbody>
                   </table>

                  
               </div>
                   }
                    <span className='flex justify-center'>
                   <button onClick={()=>{
                   
                  
                    const seen = new Set();

                    // Filter out duplicate objects based on Auth_CD
                    const uniqueTransactions = finalList.filter(transaction => {
                        const isDuplicate = seen.has(transaction.Auth_CD);
                        seen.add(transaction.Auth_CD);
                        return !isDuplicate;
                    });

                    setFinalList(uniqueTransactions)
                    setDltBtn(false)
                    console.log("uni len",uniqueTransactions.length)
                    calculateTotals(uniqueTransactions)
                   
                   setTimeout(()=>{
                    document.getElementById('btn').click()
                   },1000)
 

                   }} className='my-3 px-5 py-1 border rounded-md bg-blue-500 hover:bg-blue-600 cursor-pointer text-white' id="btn">Download PDF</button>
                   </span>
                    
                </>
            )}
        </div>
    );
}

export default ExcelReader;
