
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';

export default function Home() {

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
  const [rows, setRows] = useState([...]); // 생략 가능, 앞서 입력된 항목들 삽입

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
      <img src="/logo-dabin.png" alt="다빈이앤씨 로고" className="h-12 mb-2" />
      <h1 className="text-2xl font-bold mb-2">실행 내역서</h1>
      {/* ...계약 정보 입력 영역 및 테이블 렌더링... */}
    </div>
  );
}
