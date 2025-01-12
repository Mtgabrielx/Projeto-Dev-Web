if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPieChart);
} else {
    initPieChart();
}
  
function initPieChart() {
    const pieChart = document.getElementById('pieChart');
    if (!pieChart) {
        console.error('Elemento "pieChart" não encontrado.');
        return;
    }

    const items = JSON.parse(pieChart.getAttribute('data-items'));

    if (items && items.length > 0) {
        const total = items.reduce((sum, item) => sum + item.value, 0);
        let startAngle = 0;

        const gradient = items
        .map(item => {
            const proportion = (item.value / total) * 360;
            const endAngle = startAngle + proportion;
            const segment = `${item.color} ${startAngle}deg ${endAngle}deg`;
            startAngle = endAngle;
            return segment;
        })
        .join(', ');

        pieChart.style.background = `conic-gradient(${gradient})`;
    }
}