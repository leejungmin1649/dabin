// 필요한 import 유지
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState('');
  const [rows, setRows] = useState([]);

  const options = {
    공정: ['주자재', '공통공사', '건물태양광', '토지태양광', '주차장태양광', '인허가', '기타'],
    품목: [
      '모듈', '인버터', '구조물', '송전설비(저압)', '송전설비(고압)', '모니터링', '태양광감시제어',
      '구조물 및 모듈설치', '전기공사', '안전사다리', '안전구조물', '전기실설치', '단락 및 접지공사',
      '기초공사', '전기설계감리', '구조안전검토', '사용전검사', '구조검토현장실측', '지붕공사',
      '건물구조공사', '표준시설부담금액', '영업비', '소규모환경영향평가', '정밀안전진단',
      '개발행위용역', '토지비용', '민원비용', '컨설팅비용', '토목공사', '1차인입공사',
      '관리비 및 이윤', '장비사용료', '팩토링수수료', '역전력계량기(한전)', '전력거래소계량기', 'CCTV'
    ],
    단위: ['장', '대', 'KW', '식', 'M', '㎡']
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setProjectName(decoded.projectName || '');
        setDate(decoded.date || '');
        setContractAmount(decoded.contractAmount || '');
        setContractCapacity(decoded.contractCapacity || '');
        setRows(decoded.rows || []);
      } catch (err) {
        console.error('복원 오류:', err);
      }
    }
  }, []);

  const formatNumber = (num) => {
    const n = parseInt(num?.toString().replace(/,/g, ''));
    return isNaN(n) ? '' : n.toLocaleString('ko-KR');
  };

  const handleContractAmountChange = (val) => {
    const onlyNum = val.replace(/[^\d]/g, '');
    setContractAmount(onlyNum);
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
    const updatedRows = [...rows];
    updatedRows.splice(index + 1, 0, newRow);
    setRows(updatedRows);
  };

  const deleteRow = (id) => setRows(rows.filter(row => row.id !== id));

  const calculateTotal = () => rows.reduce((sum, r) => sum + (r.수량 * r.단가 || 0), 0);
  const totalAmount = calculateTotal();
  const revenue = parseInt(contractAmount.replace(/,/g, '')) - totalAmount;
  const unitPrice = contractCapacity ? Math.floor(totalAmount / contractCapacity) : 0;
  const execRate = contractAmount ? ((totalAmount / parseInt(contractAmount.replace(/,/g, ''))) * 100).toFixed(2) : '-';

  const renderSelectOrInput = (i, key) => {
    if (options[key]) {
      return (
        <select value={rows[i][key]} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full px-2 py-1">
          <option value="">선택</option>
          {options[key].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input value={rows[i][key]} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full px-2 py-1" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full text-sm border border-white mb-4">
        <thead className="bg-gray-700">
          <tr>
            {['공정','품목','규격','단위','수량','단가','금액','업체','비고','추가','삭제'].map(h => (
              <th key={h} className="border px-2 py-1">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              {['공정','품목','규격','단위'].map(key => (
                <td key={key} className="border px-1 py-1">
                  {renderSelectOrInput(i, key)}
                </td>
              ))}
              {['수량','단가'].map(key => (
                <td key={key} className="border px-1 py-1">
                  <input value={formatNumber(r[key])} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full text-base text-right min-w-[100px] px-2 py-1" />
                </td>
              ))}
              <td className="border px-2 py-1 text-right text-base min-w-[100px]">{formatNumber(r.수량 * r.단가)}</td>
              <td className="border px-1 py-1">
                <input value={r.업체} onChange={e => updateRow(i, '업체', e.target.value)} className="bg-gray-800 w-full text-base min-w-[120px] px-2 py-1" />
              </td>
              <td className="border px-1 py-1">
                <input value={r.비고} onChange={e => updateRow(i, '비고', e.target.value)} className="bg-gray-800 w-full text-base min-w-[120px] px-2 py-1" />
              </td>
              <td className="border px-1 py-1 text-center">
                <button onClick={() => addRowAt(i)} className="text-green-400">➕</button>
              </td>
              <td className="border px-1 py-1 text-center">
                <button onClick={() => deleteRow(r.id)} className="text-red-400">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
