
import { useState } from 'react';

export default function Home() {
  const [rows, setRows] = useState([
    { id: 1, 공정: '주자재', 품목: '인버터', 규격: '125kW', 단위: '대', 수량: 2, 단가: 5500000 },
    { id: 2, 공정: '주자재', 품목: '구조물', 규격: '', 단위: 'kW', 수량: 247, 단가: 80000 },
    { id: 3, 공정: '주자재', 품목: '송전설비', 규격: '저압반', 단위: '식', 수량: 1, 단가: 4500000 },
  ]);

  const updateRow = (index, key, value) => {
    const newRows = [...rows];
    newRows[index][key] = value;
    setRows(newRows);
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.수량 * row.단가 || 0), 0).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">실행 내역 자동 계산기</h1>
      <table className="w-full table-auto border border-white mb-6">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-2">공정</th>
            <th className="border px-2">품목</th>
            <th className="border px-2">규격</th>
            <th className="border px-2">단위</th>
            <th className="border px-2">수량</th>
            <th className="border px-2">단가</th>
            <th className="border px-2">금액</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="text-center">
              <td className="border px-2">{row.공정}</td>
              <td className="border px-2">{row.품목}</td>
              <td className="border px-2">{row.규격}</td>
              <td className="border px-2">{row.단위}</td>
              <td className="border px-2">
                <input type="number" className="bg-gray-800 w-20 text-white" value={row.수량}
                  onChange={(e) => updateRow(i, '수량', parseFloat(e.target.value))} />
              </td>
              <td className="border px-2">
                <input type="number" className="bg-gray-800 w-24 text-white" value={row.단가}
                  onChange={(e) => updateRow(i, '단가', parseFloat(e.target.value))} />
              </td>
              <td className="border px-2">{(row.수량 * row.단가 || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right text-lg font-semibold">
        총합계: {calculateTotal()} 원
      </div>
    </div>
  );
}
