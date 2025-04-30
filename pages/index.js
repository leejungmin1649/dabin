
import { useState } from 'react';

export default function Home() {
  const [rows, setRows] = useState([
    { id: 1, 공정: '주자재', 품목: '인버터', 규격: '125kW', 단위: '대', 수량: 2, 단가: 5500000, 업체: '', 비고: '' },
    { id: 2, 공정: '주자재', 품목: '구조물', 규격: '', 단위: 'kW', 수량: 247, 단가: 80000, 업체: '', 비고: '' },
    { id: 3, 공정: '주자재', 품목: '송전설비', 규격: '저압반', 단위: '식', 수량: 1, 단가: 4500000, 업체: '', 비고: '' },
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
      <h1 className="text-2xl font-bold mb-6">실행 내역 자동 계산기</h1>
      <table className="w-full table-auto border border-white mb-4 text-sm">
        <thead>
          <tr className="bg-gray-800">
            {['공정', '품목', '규격', '단위', '수량', '단가', '금액', '업체', '비고', '삭제'].map((col) => (
              <th key={col} className="border px-2 py-1">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="text-center">
              {['공정', '품목', '규격', '단위'].map((key) => (
                <td key={key} className="border px-2 py-1">
                  <input
                    className="bg-gray-800 text-white w-full"
                    value={row[key]}
                    onChange={(e) => updateRow(i, key, e.target.value)}
                  />
                </td>
              ))}
              {['수량', '단가'].map((key) => (
                <td key={key} className="border px-2 py-1">
                  <input
                    className="bg-gray-800 text-white text-right w-full"
                    value={formatNumber(row[key])}
                    onChange={(e) => updateRow(i, key, e.target.value)}
                  />
                </td>
              ))}
              <td className="border px-2 py-1 text-right">
                {formatNumber(row.수량 * row.단가 || 0)}
              </td>
              {['업체', '비고'].map((key) => (
                <td key={key} className="border px-2 py-1">
                  <input
                    className="bg-gray-800 text-white w-full"
                    value={row[key]}
                    onChange={(e) => updateRow(i, key, e.target.value)}
                  />
                </td>
              ))}
              <td className="border px-2 py-1">
                <button onClick={() => deleteRow(row.id)} className="text-red-400">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-4">
        <button
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          ➕ 행 추가
        </button>
      </div>
      <div className="text-right text-lg font-semibold">
        총합계: {calculateTotal()} 원
      </div>
    </div>
  );
}
