import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [projectName, setProjectName] = useState('주식회사 다빈이앤씨');
  const [date, setDate] = useState('2025년 04월 30일');
  const [contractAmount, setContractAmount] = useState('145000000');
  const [contractCapacity, setContractCapacity] = useState(100);
  const [rows, setRows] = useState([
    { id: 1, 공정: '주자재', 품목: '인버터', 규격: '125kW', 단위: '대', 수량: 1, 단가: 5500000, 업체: '', 비고: '' },
    { id: 2, 공정: '주자재', 품목: '구조물제작', 규격: '', 단위: 'KW', 수량: 100, 단가: 80000, 업체: '', 비고: '' },
  ]);

  // 콤마 표시 함수
  const formatNumber = (num) => {
    const parsed = parseInt(num?.toString().replace(/,/g, ''));
    return isNaN(parsed) ? '' : parsed.toLocaleString('ko-KR');
  };

  // 계약금액 입력 시 콤마 자동처리
  const handleContractAmountChange = (value) => {
    const onlyNumbers = value.replace(/[^\d]/g, '');
    setContractAmount(onlyNumbers);
  };

  const updateRow = (index, key, value) => {
    const newRows = [...rows];
    if (key === '수량' || key === '단가') {
      newRows[index][key] = parseFloat(value.replace(/,/g, '')) || 0;
    } else {
      newRows[index][key] = value;
    }
    setRows(newRows);
  };

  const addRowAt = (index) => {
    const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow = { id: nextId, 공정: '', 품목: '', 규격: '', 단위: '', 수량: 0, 단가: 0, 업체: '', 비고: '' };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newRow);
    setRows(newRows);
  };

  const deleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.수량 * row.단가 || 0), 0);
  };

  const totalAmount = calculateTotal();
  const revenue = parseInt(contractAmount.replace(/,/g, '')) - totalAmount;
  const unitPrice = contractCapacity ? Math.floor(totalAmount / contractCapacity) : 0;
  const execRate = contractAmount ? ((totalAmount / parseInt(contractAmount.replace(/,/g, ''))) * 100).toFixed(2) : '-';

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['실행 내역서'],
      ['공사명', projectName, '', '', '작성일', date],
      ['계약금액', contractAmount, '', '', '계약용량', contractCapacity],
      ['수익금액', revenue, '', '', '실행금액', totalAmount],
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
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div><img src="/20250411_235807.png" className="h-12" /></div>
        <input value={projectName} onChange={e => setProjectName(e.target.value)} className="bg-gray-800 p-2" placeholder="공사명" />
        <input value={date} onChange={e => setDate(e.target.value)} className="bg-gray-800 p-2" placeholder="작성일" />
        <input
          value={formatNumber(contractAmount)}
          onChange={e => handleContractAmountChange(e.target.value)}
          className="bg-gray-800 p-2"
          placeholder="계약금액"
        />
        <input
          value={contractCapacity}
          onChange={e => setContractCapacity(parseFloat(e.target.value) || 0)}
          className="bg-gray-800 p-2"
          placeholder="계약용량"
        />
        <input value={formatNumber(revenue)} readOnly className="bg-gray-800 p-2" placeholder="수익금액" />
        <input value={formatNumber(totalAmount)} readOnly className="bg-gray-800 p-2" placeholder="실행금액" />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm border border-white mb-4 min-w-[800px]">
          <thead className="bg-gray-700">
            <tr>
              {['공정', '품목', '규격', '단위', '수량', '단가', '금액', '업체', '비고', '추가', '삭제'].map((col, idx) => (
                <th key={idx} className="border px-2 py-1 whitespace-nowrap">{col}</th>
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
                    <input value={formatNumber(row[key])} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 text-right w-full" />
                  </td>
                ))}
                <td className="border px-2 py-1 text-right">{formatNumber(row.수량 * row.단가)}</td>
                <td className="border px-2 py-1"><input value={row.업체} onChange={e => updateRow(i, '업체', e.target.value)} className="bg-gray-800 w-full" /></td>
                <td className="border px-2 py-1"><input value={row.비고} onChange={e => updateRow(i, '비고', e.target.value)} className="bg-gray-800 w-full" /></td>
                <td className="border px-2 py-1 text-center"><button onClick={() => addRowAt(i)} className="text-green-400">➕</button></td>
                <td className="border px-2 py-1 text-center"><button onClick={() => deleteRow(row.id)} className="text-red-400">❌</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={() => addRowAt(rows.length - 1)} className="bg-blue-600 px-4 py-2 rounded text-white">➕ 마지막에 행 추가</button>
          <button onClick={exportToExcel} className="bg-yellow-500 px-4 py-2 rounded text-black">📥 Excel 다운로드</button>
        </div>
        <div className="text-xl font-bold text-right sm:text-left">
          총합계: {formatNumber(totalAmount)} 원
          <div className="text-sm text-gray-300 mt-1">
            실행단가: {contractCapacity ? `${formatNumber(unitPrice)} 원/kW` : '-'}<br />
            실행율: {execRate}%<br />
            수익금액: {formatNumber(revenue)} 원
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-center text-gray-400 border-t border-gray-700 pt-4">
        ※ 본 실행계산기는 다빈이앤씨 임직원을 위한 내부 전용 플랫폼으로, 무단 유출 및 외부 사용 시 저작권 침해로 간주되어 법적 책임을 물을 수 있습니다.
      </div>
    </div>
  );
}
