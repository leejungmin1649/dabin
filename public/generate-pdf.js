
function generatePDF(data, projectInfo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('실 행 내 역 서', 105, 20, null, null, 'center');

  doc.setFontSize(10);
  doc.text(`공사명: ${projectInfo.name || ''}`, 14, 30);
  doc.text(`작성일: ${projectInfo.date || ''}`, 150, 30);
  doc.text(`계약금액: ${projectInfo.contractAmount || ''} 원`, 14, 37);
  doc.text(`수익금액: ${projectInfo.revenueAmount || ''} 원`, 80, 37);
  doc.text(`계약용량: ${projectInfo.contractCapacity || ''} kW`, 150, 37);
  doc.text(`실행금액: ${projectInfo.total || ''} 원`, 14, 44);
  doc.text(`실행율: ${projectInfo.rate || ''} %`, 80, 44);
  doc.text(`실행단가: ${projectInfo.unitPrice || ''} 원/kW`, 150, 44);

  doc.autoTable({
    startY: 55,
    head: [['공정', '품목', '규격', '단위', '수량', '단가', '금액', '업체', '비고']],
    body: data.map(row => [
      row.공정, row.품목, row.규격, row.단위,
      row.수량?.toLocaleString() ?? '',
      row.단가?.toLocaleString() ?? '',
      (row.수량 * row.단가)?.toLocaleString() ?? '',
      row.업체, row.비고
    ]),
    styles: { fontSize: 8 },
  });

  doc.setFontSize(9);
  doc.text('※ 본 실행내역서는 추정치를 기반으로 작성된 자료로, 실제 시공 내용과 차이가 발생할 수 있습니다.', 14, doc.lastAutoTable.finalY + 10);

  doc.save('실행내역서.pdf');
}
