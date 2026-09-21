document.addEventListener('DOMContentLoaded', () => {

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Google Sheet Rates
  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxDCHLgWiqVdFMH1yGBN3raT9ccoA3rJ0y7HxD28NVHWWnbgJNnfQe1PLRXX9S13TMsaZYkIoHczuu/pub?output=csv';

  fetch(sheetUrl)
    .then(response => response.text())
    .then(csv => {

      const rows = csv.trim().split(/\r?\n/).map(row =>
        row.split(',').map(cell =>
          cell.trim().replace(/^"|"$/g, '')
        )
      );

      if (rows.length < 2) return;

      const headers = rows[0].map(h => h.toLowerCase().trim());

      const productIndex = headers.indexOf('product');
      const rateIndex = headers.indexOf('rate');
      const unitIndex = headers.indexOf('unit');

      if (productIndex === -1 || rateIndex === -1) return;

      // Front Sugar Rate
      const frontSugarRate =
        document.querySelector('#front-sugar-rate');

      // Rates section
      const ratesSection =
        document.querySelector('#rates .product-grid');

      // Find Sugar
      const sugarRow = rows.slice(1).find(row =>
        row[productIndex] &&
        row[productIndex].trim().toLowerCase() === 'sugar'
      );

      // Update front notification
      if (sugarRow && frontSugarRate) {
        const sugarRate = sugarRow[rateIndex];
        const sugarUnit =
          unitIndex !== -1 ? sugarRow[unitIndex] : 'kg';

        frontSugarRate.textContent =
          `₹${sugarRate}/${sugarUnit}`;
      }

      // Update Rates section
      if (ratesSection) {

        ratesSection.innerHTML = '';

        rows.slice(1).forEach(row => {

          const product = row[productIndex];
          const rate = row[rateIndex];
          const unit =
            unitIndex !== -1 ? row[unitIndex] : '';

          if (!product || !rate) return;

          const card = document.createElement('div');
          card.className = 'product-card';

          card.innerHTML = `
            <h3>${product}</h3>
            <p><strong>₹${rate}/${unit}</strong></p>
          `;

          ratesSection.appendChild(card);
        });
      }

    })
    .catch(error => {
      console.log('Rates could not be loaded:', error);
    });

});