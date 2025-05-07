import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import * as XLSX from 'xlsx';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState('');
  const [rows, setRows] = useState([]);

  // 카카오 공유 횟수 저장
  const [shareCount, setShareCount] = useState(0);
  useEffect(() => {
    const saved = parseInt(localStorage.getItem('kakaoShareCount') || '0', 10);
    setShareCount(isNaN(saved) ? 0 : saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('kakaoShareCount', shareCount);
  }, [shareCount]);

  // URL 파라미터 복원
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

  // Kakao SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('a02ad11689f9d4b1ffd2a081c08d5270');
    }
  }, []);

  const formatNumber = (num) => {
    const n = parseInt(num?.toString().replace(/,/g, ''), 10);
    return isNaN(n) ? '' : n.toLocaleString('ko-KR');
  };

  const handleContractAmountChange = (val) => {
    setContractAmount(val.replace(/[^\d]/g, ''));
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
    const updated = [...rows];
    updated.splice(index + 1, 0, newRow);
    setRows(updated);
  };

  const deleteRow = (id) => setRows(rows.filter(r => r.id !== id));

  const totalAmount = rows.reduce((sum, r) => sum + (r.수량 * r.단가 || 0), 0);
  const revenue = parseInt(contractAmount.replace(/,/g, ''), 10) - totalAmount;
  const unitPrice = contractCapacity ? Math.floor(totalAmount / contractCapacity) : 0;
  const execRate = contractAmount
    ? ((totalAmount / parseInt(contractAmount.replace(/,/g, ''), 10)) * 100).toFixed(2)
    : '-';

  // URL 공유
  const shareLink = () => {
    const payload = { projectName, date, contractAmount, contractCapacity, rows };
    const url = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(JSON.stringify(payload))}`;
    navigator.clipboard.writeText(url);
    alert('복사 완료! 붙여넣기하면 복원됩니다.');
  };

  // 엑셀 업로드
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      try {
        setProjectName(jsonData[1]?.[1] || '');
        setDate(jsonData[1]?.[5] || '');
        setContractAmount(jsonData[2]?.[1]?.toString().replace(/,/g, '') || '');
        setContractCapacity(jsonData[2]?.[5] || '');
        const startIndex = jsonData.findIndex(r => r[0] === '공정');
        if (startIndex < 0) return;
        const tableRows = jsonData.slice(startIndex + 1)
          .filter(r => r[0])
          .map((r, i) => ({
            id: i + 1,
            공정: r[0] || '', 품목: r[1] || '', 규격: r[2] || '', 단위: r[3] || '',
            수량: parseFloat(r[4]) || 0,
            단가: parseFloat(r[5]?.toString().replace(/,/g, '')) || 0,
            업체: r[7] || '', 비고: r[8] || ''
          }));
        setRows(tableRows);
      } catch (err) {
        alert('엑셀 파일 구조가 잘못되었거나 파싱에 실패했습니다.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 엑셀 다운로드
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
      r.수량 || 0, r.단가 || 0, r.수량 * r.단가 || 0,
      r.업체, r.비고
    ]);
    body.push(['', '', '', '', '', '', totalAmount, '', '']);
    data.push(...body);
    const ws = XLSX.utils.aoa_to_sheet(data);
    const { s, e } = XLSX.utils.decode_range(ws['!ref']);
    for (let R = s.r + 6; R <= e.r; ++R) {
      ['F', 'G'].forEach(col => {
        const cell = ws[`${col}${R + 1}`];
        if (cell && typeof cell.v === 'number') {
          cell.t = 'n'; cell.z = '#,##0';
        }
      });
    }
    XLSX.utils.book_append_sheet(wb, ws, '실행내역서');
    XLSX.writeFile(wb, '실행내역서.xlsx');
  };

  // 카카오톡 공유
  const handleKakaoShare = () => {
    const shareUrl = window.location.href;
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: projectName || '실행 내역서',
        description: `계약금액: ${formatNumber(contractAmount)}원\n수익금액: ${formatNumber(revenue)}원`,
        imageUrl: 'https://dabin-78.vercel.app/logo-dabin.png',
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl }
      },
      buttons: [
        { title: '웹에서 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
        { title: '엑셀 다운로드', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }
      ]
    });
    setShareCount(prev => prev + 1);
  };

  return (
    <>
      <Script src="https://developers.kakao.com/sdk/js/kakao.min.js" strategy="beforeInteractive" />
      <div className="bg-gray-900 text-white p-4 sm:p-8 min-h-screen">
        {/* 상단 로고 & 링크 */}
        <div className="text-center mb-6">
          <a href="http://www.dabinenc.com" target="_blank" rel="noopener noreferrer">
            <img src="/logo-dabin.png" alt="" className="mx-auto h-16 mb-2" />
          </a>
        </div>
        {/* 입력 필드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <input value={projectName} onChange={e => setProjectName(e.target.value)} className="bg-gray-800 p-2" placeholder="공사명" />
          <input value={date} onChange={e => setDate(e.target.value)} className="bg-gray-800 p-2" placeholder="작성일" />
          <input value={formatNumber(contractAmount)} onChange={e => handleContractAmountChange(e.target.value)} className="bg-gray-800 p-2" placeholder="계약금액" />
          <input value={contractCapacity} onChange={e => setContractCapacity(parseFloat(e.target.value) || 0)} className="bg-gray-800 p-2" placeholder="계약용량" />
        </div>
        {/* 결과 요약 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <input value={formatNumber(revenue)} readOnly className="bg-gray-800 p-2" placeholder="수익금액" />
          <input value={formatNumber(totalAmount)} readOnly className="bg-gray-800 p-2" placeholder="실행금액" />
          <input value={execRate + '%'} readOnly className="bg-gray-800 p-2" placeholder="실행율" />
        </div>
        {/* 테이블 */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-[900px] w-full text-sm border border-white">
            <thead className="bg-gray-700">
              <tr>
                {['공정','품목','규격','단위','수량','단가','금액','업체','비고','추가','삭제'].map(h => (<th key={h} className="border px-2 py-1">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  {['공정','품목','규격','단위'].map(key => (<td key={key} className="border px-1 py-1"><input value={r[key]} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full px-2 py-1" /></td>))}
                  {['수량','단가'].map(key => (<td key={key} className="border px-1 py-1"><input value={formatNumber(r[key])} onChange={e => updateRow(i, key, e.target.value)} className="bg-gray-800 w-full text-right px-2 py-1" /></td>))}
                  <td className="border px-2 py-1 text-right">{formatNumber(r.수량 * r.단가)}</td>
                  <td className="border px-1 py-1"><input value={r.업체} onChange={e => updateRow(i, '업체', e.target.value)} className="bg-gray-800 w-full px-2 py-1" /></td>
                  <td className="border px-1 py-1"><input value={r.비고} onChange={e => updateRow(i, '비고', e.target.value)} className="bg-gray-800 w-full px-2 py-1" /></td>
                  <td className="border px-1 py-1 text-center"><button onClick={() => addRowAt(i)} className="text-green-400">➕</button></td>
                  <td className="border px-1 py-1 text-center"><button onClick={() => deleteRow(r.id)} className="text-red-400">❌</button></td>
                </tr>))}
              <tr className="bg-gray-800 font-bold">
                <td colSpan={6} className="text-right px-2 py-1 border">총 합계금액</td><td className="text-right px-2 py-1 border">{formatNumber(totalAmount)}</td><td colSpan={3} className="border"></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 버튼 그룹 */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => addRowAt(rows.length-1)} className="bg-blue-600 px-4 py-2 rounded text-white">➕ 행 추가</button>
            <button onClick={exportToExcel} className="bg-yellow-500 px-4 py-2 rounded text-black">📥 Excel 다운로드</button>
            <button onClick={shareLink} className="bg-green-600 px-4 py-2 rounded text-white">🔗 URL 공유</button>
            <button onClick={handleKakaoShare} className="bg-yellow-600 px-4 py-2 rounded text-white">🟨 카카오톡 공유</button>
          </div>
          <span>카카오 공유 횟수: {shareCount}회</span>
          <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="bg-gray-800 px-4 py-2 text-white rounded border border-gray-600" />
        </div>
        {/* 고지문구 */}
        <div className="text-center text-sm text-gray-400 border-t border-gray-700 pt-4">
          ※ 본 실행계산기는 다빈이앤씨 임직원을 위한 내부 전용 플랫폼으로, 무단 유출 및 외부 사용 시 저작권 침해로 간주되어 법적 책임을 물을 수 있습니다.
        </div>
      </div>
    </>
  );
}
