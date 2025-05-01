import Head from 'next/head';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState('');
  const [rows, setRows] = useState([]);

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

  const shareLink = () => {
    const data = { projectName, date, contractAmount, contractCapacity, rows };
    const encoded = encodeURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('복사 완료! 붙여넣기하면 공유된 값이 복원됩니다.');
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['실행 내역서'],
      ['공사명', projectName, '', '', '작성일', date],
      ['계약금액', contractAmount, '', '', '계약용량', contractCapacity],
      ['수익금액', revenue, '', '', '실행금액', totalAmount],
      [],
      ['공정','품목','규격','단위','수량','단가','금액','업체','비고']
    ];
    const body = rows.map(r => [
      r.공정, r.품목, r.규격, r.단위,
      r.수량 || '', r.단가?.toLocaleString() || '',
      (r.수량 * r.단가)?.toLocaleString() || '',
      r.업체, r.비고
    ]);
    body.push(['', '', '', '', '', '', formatNumber(totalAmount), '', '']);
    data.push(...body);
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '실행내역서');
    XLSX.writeFile(wb, '실행내역서.xlsx');
  };

  return (
    <div className="bg-gray-900 text-white p-4 sm:p-8 min-h-screen">
      <Head>
        <title>실행계산기 - 다빈이앤씨</title>
        <meta property="og:title" content="실행계산기 - 다빈이앤씨" />
        <meta property="og:description" content="공정·품목·단가 기반 실시간 실행내역 계산기" />
        <meta property="og:image" content="/logo-dabin.png" />
        <meta property="og:url" content="https://dabins0.vercel.app/" />
      </Head>

      {/* ... 이하 동일 ... */}
    </div>
  );
}
