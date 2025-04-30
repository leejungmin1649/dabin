import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';

export default function Home() {

  useEffect(() => {
    // Load from localStorage
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
    // Save to localStorage
    localStorage.setItem('execution-data', JSON.stringify({
      rows, projectName, date, contractAmount, contractCapacity, revenueAmount
    }));
  }, [rows, projectName, date, contractAmount, contractCapacity, revenueAmount]);

  const groupRowsWithSubtotal = () => {
    const grouped = {};
    rows.forEach(row => {
      const key = row.공정 || '기타';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const finalRows = [];
    Object.keys(grouped).forEach(group => {
      const items = grouped[group];
      finalRows.push(...items);
      const subtotal = items.reduce((sum, r) => sum + (r.수량 * r.단가 || 0), 0);
      finalRows.push({ 공정: '', 품목: '▶ ' + group + ' 소계', 규격: '', 단위: '', 수량: '', 단가: '', 금액: subtotal, 업체: '', 비고: '' });
    });
    return finalRows;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['실행 내역서'],
      ['공사명', projectName, '', '', '작성일', date],
      ['계약금액', contractAmount, '', '', '계약용량', contractCapacity],
      ['수익금액', revenueAmount, '', '', '실행금액', calculateTotal().replace(/,/g, '')],
      [],
      ['공정','품목','규격','단위','수량','단가','금액','업체','비고']
    ];
    const body = groupRowsWithSubtotal().map(r => [
      r.공정, r.품목, r.규격, r.단위,
      r.수량 || '', r.단가?.toLocaleString() || '',
      (r.금액 || (r.수량 * r.단가))?.toLocaleString() || '',
      r.업체, r.비고
    ]);
    data.push(...body);

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '실행내역서');
    XLSX.writeFile(wb, '실행내역서.xlsx');
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/generate-pdf.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('2025년 04월 30일');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState(247.00);
  const [revenueAmount, setRevenueAmount] = useState('');

  const [rows, setRows] = useState([
  { 공정: "주자재", 품목: "인버터", 규격: "125kW", 단위: "대", 수량: 1, 단가: 5500000, 업체: "", 비고: "", id: 1 },
  { 공정: "주자재", 품목: "구조물제작", 규격: "용융 또는 포스멕", 단위: "KW", 수량: 100, 단가: 80000, 업체: "", 비고: "", id: 2 },
  { 공정: "주자재", 품목: "송전설비", 규격: "저압반", 단위: "식", 수량: 1, 단가: 2000000, 업체: "", 비고: "", id: 3 },
  { 공정: "주자재", 품목: "모니터링", 규격: "", 단위: "식", 수량: 1, 단가: 350000, 업체: "", 비고: "", id: 4 },
  { 공정: "주자재", 품목: "태양광감시제어", 규격: "", 단위: "식", 수량: 1, 단가: 6500000, 업체: "", 비고: "출력제어", id: 5 },
  { 공정: "공통공사", 품목: "구조물 및 모듈설치", 규격: "", 단위: "KW", 수량: 100, 단가: 80000, 업체: "", 비고: "트레이설치,단판 및 전지포함", id: 6 },
  { 공정: "공통공사", 품목: "전기공사", 규격: "", 단위: "KW", 수량: 100, 단가: 120000, 업체: "", 비고: "", id: 7 },
  { 공정: "토지태양광", 품목: "토목공사", 규격: "", 단위: "평", 수량: 300, 단가: 30000, 업체: "", 비고: "기초,메쉬헬스,출입문 등", id: 8 },
  { 공정: "건물태양광", 품목: "안전사다리", 규격: "", 단위: "식", 수량: 1, 단가: 1000000, 업체: "", 비고: "", id: 9 },
  { 공정: "인허가", 품목: "전기설계감리", 규격: "", 단위: "식", 수량: 1, 단가: 1000000, 업체: "", 비고: "1가지타입경우", id: 10 },
  { 공정: "인허가", 품목: "구조안전검토", 규격: "", 단위: "식", 수량: 1, 단가: 600000, 업체: "", 비고: "", id: 11 },
  { 공정: "인허가", 품목: "사용전검사", 규격: "", 단위: "식", 수량: 1, 단가: 200000, 업체: "", 비고: "", id: 12 },
  { 공정: "기타", 품목: "개발행위허가 8 억", 규격: "", 단위: "식", 수량: 1, 단가: 2000000, 업체: "", 비고: "토지(설계업체)", id: 13 },
  { 공정: "기타", 품목: "영업비", 규격: "", 단위: "KW", 수량: 100, 단가: 100000, 업체: "", 비고: "500kW이상", id: 14 },
]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      
    <div className="mb-6">
<img src="/logo-dabin.png" alt="다빈이앤씨 로고" className="h-12 mb-2" />
      <h1 className="text-2xl font-bold mb-2">실행 내역서</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-semibold">공사명</label>
          <input type="text" className="bg-gray-800 text-white w-full p-1" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
    </div>  );}