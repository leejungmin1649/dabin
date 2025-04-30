import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Head from 'next/head';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('2025년 04월 30일');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState(1000);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [rows, setRows] = useState([
    { id: 1, 공정: '주자재', 품목: '인버터', 규격: '125kW', 단위: '대', 수량: 1, 단가: 5500000, 업체: '', 비고: '찰떡패턴' },
    { id: 2, 공정: '주자재', 품목: '구조물제작', 규격: '중형 쏜톤 로스펙', 단위: '적', 수량: 100, 단가: 80000, 업체: '', 비고: '기초플레임' },
    { id: 3, 공정: '주자재', 품목: '송전설비', 규격: '저압반', 단위: '식', 수량: 1, 단가: 200000, 업체: '', 비고: '절단판' },
    { id: 4, 공정: '공통공사', 품목: '인터티', 규격: '', 단위: '식', 수량: 1, 단가: 1000000, 업체: '', 비고: '낙차(설계준비,출품)' },
    { id: 5, 공정: '공통공사', 품목: '토목공사', 규격: '', 단위: '식', 수량: 100, 단가: 600000, 업체: '', 비고: '500kW이하' },
    { id: 6, 공정: '건물태양광', 품목: '만련설계', 규격: '', 단위: '식', 수량: 1, 단가: 100000, 업체: '', 비고: '' },
    { id: 7, 공정: '건물태양광', 품목: '사용사다', 규격: '', 단위: '식', 수량: 1, 단가: 100000, 업체: '', 비고: '' },
    { id: 8, 공정: '건타', 품목: '인터타리', 규격: '', 단위: '식', 수량: 1, 단가: 100000, 업체: '', 비고: '' },
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

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.수량 * row.단가 || 0), 0);
  };

  const formatNumber = (num) => num?.toLocaleString() ?? '-';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <img src="/logo-dabin.png" alt="다빈이앤씨 로고" className="h-12" />
        <h1 className="text-3xl font-bold">실행 내역서</h1>
        <div className="text-right text-sm">
          <div>{formatNumber(calculateTotal())} 원</div>
          <div>{contractAmount ? ((calculateTotal() / parseFloat(contractAmount)) * 100).toFixed(2) : '-'}%</div>
          <div>{contractCapacity ? (calculateTotal() / contractCapacity).toLocaleString() : '-'} 원/kW</div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
        <input value={projectName} onChange={e => setProjectName(e.target.value)} className="bg-gray-800 p-2" placeholder="공사명" />
        <input value={date} onChange={e => setDate(e.target.value)} className="bg-gray-800 p-2" placeholder="작성일" />
        <input value={contractAmount} onChange={e => setContractAmount(e.target.value)} className="bg-gray-800 p-2" placeholder="계약금액" />
        <input value={calculateTotal().toLocaleString()} readOnly className="bg-gray-800 p-2" placeholder="실행금액" />
        <input value={revenueAmount} onChange={e => setRevenueAmount(e.target.value)} className="bg-gray-800 p-2" placeholder="수익금액" />
        <input value={contractCapacity} onChange={e => setContractCapacity(e.target.value)} className="bg-gray-800 p-2" placeholder="계약용량" />
        <input value={(calculateTotal() / contractCapacity).toLocaleString()} readOnly className="bg-gray-800 p-2" placeholder="실행단가" />
      </div>
      <table className="table-auto w-full text-sm border border-white mb-4">
        <thead className="bg-gray-700">
          <tr>
            {['공정', '품목', '규격', '단위', '수량', '단가', '금액', '업체', '비고', '삭제'].map((col, idx) => (
              <th key={idx} className="border px-2 py-1">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id}>
              {['공정', '품목', '규격', '단위'].map(key => (
                <td key={key} className="border px-2 py-1">
                  <input value={row[key]} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full" />
                </td>
              ))}
              {['수량', '단가'].map(key => (
                <td key={key} className="border px-2 py-1">
                  <input value={row[key]?.toLocaleString()} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 text-right w-full" />
                </td>
              ))}
              <td className="border px-2 py-1 text-right">{formatNumber(row.수량 * row.단가)}</td>
              <td className="border px-2 py-1">
                <input value={row.업체} onChange={e => updateRow(i, '업체', e.target.value)} className="bg-gray-800 w-full" />
              </td>
              <td className="border px-2 py-1">
                <input value={row.비고} onChange={e => updateRow(i, '비고', e.target.value)} className="bg-gray-800 w-full" />
              </td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => deleteRow(row.id)} className="text-red-400">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <button onClick={addRow} className="bg-blue-600 px-4 py-2 rounded text-white">➕ 행 추가</button>
        <div className="text-xl font-bold">총합계: {formatNumber(calculateTotal())} 원</div>
      </div>
    </div>
  );
}
