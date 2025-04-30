import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('2025년 04월 30일');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState(247.0);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [rows, setRows] = useState([
    { 공정: "주자재", 품목: "인버터", 규격: "125kW", 단위: "대", 수량: 1, 단가: 5500000, 업체: "", 비고: "", id: 1 },
    { 공정: "주자재", 품목: "구조물제작", 규격: "용융 또는 포스멕", 단위: "KW", 수량: 100, 단가: 80000, 업체: "", 비고: "", id: 2 },
    // ... 이하 생략 (위 내용 그대로 추가)
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('execution-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRows(parsed.rows || []);
      setProjectName(parsed.projectName || '');
      setDate(parsed.date || '');
      setContractAmount(parsed.contractAmount || '');
      setContractCapacity(parsed.contractCapacity || 0);
      setRevenueAmount(parsed.revenueAmount || '');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('execution-data', JSON.stringify({
      rows, projectName, date, contractAmount, contractCapacity, revenueAmount
    }));
  }, [rows, projectName, date, contractAmount, contractCapacity, revenueAmount]);

  const updateRow = (index, key, value) => {
    const newRows = [...rows];
    if (key === '수량' || key === '단가') {
      newRows[index][key] = parseFloat(value.replace(/,/g, '')) || 0;
    } else {
      newRows[index][key] = value;
    }
    setRows(newRows);
  };

  const addRow = () => {
    const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, 공정: '', 품목: '', 규격: '', 단위: '', 수량: 0, 단가: 0, 업체: '', 비고: '' }]);
  };

  const deleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() ?? '-';
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.수량 * row.단가 || 0), 0).toLocaleString();
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['실행 내역서'],
      ['공사명', projectName, '', '', '작성일', date],
      ['계약금액', contractAmount, '', '', '계약용량', contractCapacity],
      ['수익금액', revenueAmount, '', '', '실행금액', calculateTotal().replace(/,/g, '')],
      [],
      ['공정', '품목', '규격', '단위', '수량', '단가', '금액', '업체', '비고']
    ];
    const body = rows.map(r => [
      r.공정, r.품목, r.규격, r.단위,
      r.수량 || '', r.단가?.toLocaleString() || '',
      (r.수량 * r.단가)?.toLocaleString() || '',
      r.업체, r.비고
    ]);
    data.push(...body);
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '실행내역서');
    XLSX.writeFile(wb, '실행내역서.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">실행 내역서</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="공사명" className="p-2 bg-gray-800" />
        <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="작성일" className="p-2 bg-gray-800" />
        <input type="text" value={contractAmount} onChange={(e) => setContractAmount(e.target.value)} placeholder="계약금액" className="p-2 bg-gray-800" />
        <input type="text" value={revenueAmount} onChange={(e) => setRevenueAmount(e.target.value)} placeholder="수익금액" className="p-2 bg-gray-800" />
      </div>

      <button onClick={exportToExcel} className="bg-yellow-500 text-black px-4 py-2 rounded">
        📥 Excel 다운로드
      </button>
    </div>
  );
}
