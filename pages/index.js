// pages/index.js
import { useState, useEffect } from 'react';
import Script from 'next/script';
import * as XLSX from 'xlsx';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractCapacity, setContractCapacity] = useState('');
  const [rows, setRows] = useState([]);

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

  const updateRow = (i, key, val) => {
    const copy = [...rows];
    copy[i][key] = (key === '수량' || key === '단가')
      ? parseFloat(val.replace(/,/g, '')) || 0
      : val;
    setRows(copy);
  };

  const addRowAt = (i) => {
    const nextId = rows.length ? Math.max(...rows.map(r=>r.id))+1 : 1;
    setRows([
      ...rows.slice(0, i+1),
      { id: nextId, 공정:'', 품목:'', 규격:'', 단위:'', 수량:0, 단가:0, 업체:'', 비고:'' },
      ...rows.slice(i+1)
    ]);
  };

  const deleteRow = (id) => setRows(rows.filter(r=>r.id!==id));

  const totalAmount = rows.reduce((sum,r)=>sum + (r.수량*r.단가||0), 0);
  const revenue = parseInt(contractAmount.replace(/,/g,''),10) - totalAmount;
  const unitPrice = contractCapacity ? Math.floor(totalAmount/contractCapacity) : 0;
  const execRate = contractAmount
    ? ((totalAmount/parseInt(contractAmount.replace(/,/g,''),10))*100).toFixed(2)
    : '-';

  // URL 공유
  const shareLink = () => {
    const payload = { projectName, date, contractAmount, contractCapacity, rows };
    const url = `${window.location.origin}${window.location.pathname}?data=`+
      encodeURIComponent(JSON.stringify(payload));
    navigator.clipboard.writeText(url);
    alert('복사 완료! 붙여넣기하면 복원됩니다.');
  };

  // Excel 다운로드 (쉼표 포맷 적용)
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
    const body = rows.map(r=>[
      r.공정, r.품목, r.규격, r.단위,
      r.수량||0, r.단가||0, r.수량*r.단가||0,
      r.업체, r.비고
    ]);
    body.push(['','','','','','', totalAmount,'','']);
    data.push(...body);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R=range.s.r+6; R<=range.e.r; ++R) {
      ['F','G'].forEach(col => {
        const cell = ws[`${col}${R+1}`];
        if (cell && typeof cell.v==='number') {
          cell.t='n';
          cell.z='#,##0';
        }
      });
    }
    XLSX.utils.book_append_sheet(wb, ws, '실행내역서');
    XLSX.writeFile(wb, '실행내역서.xlsx');
  };

  // Kakao 링크 공유
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
  };

  return (
    <>
      <Script src="https://developers.kakao.com/sdk/js/kakao.min.js"
              strategy="beforeInteractive" />
      <div className="bg-gray-900 text-white p-4 sm:p-8 min-h-screen">
        {/* 상단 로고 & 링크 */}
        <div className="text-center mb-6">…</div>

        {/* 입력 필드 */} …{/* 동일 */}

        {/* 결과 요약 */} …{/* 동일 */}

        {/* 테이블 */} …{/* 동일 */}

        {/* 버튼 그룹 */}
        <div className="flex gap-2 mt-4">
          <button onClick={exportToExcel}
                  className="bg-yellow-500 px-4 py-2 rounded text-black">
            📥 Excel 다운로드
          </button>
          <button onClick={shareLink}
                  className="bg-green-600 px-4 py-2 rounded text-white">
            🔗 URL 공유
          </button>
          <button onClick={handleKakaoShare}
                  className="bg-yellow-600 px-4 py-2 rounded text-white">
            🟨 카카오톡 공유
          </button>
        </div>

        {/* 고지문구 */} …{/* 동일 */}
      </div>
    </>
  );
}
