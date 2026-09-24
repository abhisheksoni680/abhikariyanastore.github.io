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


  // =========================
  // GOOGLE SHEET RATES
  // =========================

  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxDCHLgWiqVdFMH1yGBN3raT9ccoA3rJ0y7HxD28NVHWWnbgJNnfQe1PLRXX9S13TMsaZYkIoHczuu/pub?output=csv';

  const ITEMS_PER_PAGE = 8;

  let allRateItems = [];
  let visibleCount = ITEMS_PER_PAGE;


  fetch(sheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Google Sheet could not be loaded');
      }

      return response.text();
    })

    .then(csv => {

      const rows = csv
        .trim()
        .split(/\r?\n/)
        .map(row =>
          row.split(',').map(cell =>
            cell.trim().replace(/^"|"$/g, '')
          )
        );


      if (rows.length < 2) {
        return;
      }


      const headers =
        rows[0].map(header =>
          header.toLowerCase().trim()
        );


      const productIndex =
        headers.indexOf('product');

      const rateIndex =
        headers.indexOf('rate');

      const unitIndex =
        headers.indexOf('unit');


      if (
        productIndex === -1 ||
        rateIndex === -1
      ) {
        return;
      }


      // Elements
      const frontSugarRate =
        document.querySelector('#front-sugar-rate');

      const ratesSection =
        document.querySelector('#rates .product-grid');

      const searchInput =
        document.querySelector('#rate-search');

      const loadMoreButton =
        document.querySelector('#rates-load-more');


      // =========================
      // FRONT SUGAR RATE
      // =========================

      const sugarRow =
        rows.slice(1).find(row =>
          row[productIndex] &&
          row[productIndex]
            .trim()
            .toLowerCase() === 'sugar'
        );


      if (sugarRow && frontSugarRate) {

        const sugarRate =
          sugarRow[rateIndex];

        const sugarUnit =
          unitIndex !== -1
            ? sugarRow[unitIndex]
            : 'kg';


        frontSugarRate.textContent =
          `₹${sugarRate}/${sugarUnit}`;
      }


      // =========================
      // STORE ALL PRODUCTS
      // =========================

      allRateItems =
        rows
          .slice(1)
          .map(row => {

            const product =
              row[productIndex];

            const rate =
              row[rateIndex];

            const unit =
              unitIndex !== -1
                ? row[unitIndex]
                : '';


            return {
              product,
              rate,
              unit
            };

          })
          .filter(item =>
            item.product &&
            item.rate
          );


      // =========================
      // DISPLAY PRODUCTS
      // =========================

      function renderRates(items) {

        if (!ratesSection) {
          return;
        }


        ratesSection.innerHTML = '';


        items.forEach(item => {

          const card =
            document.createElement('div');

          card.className =
            'product-card';


          const heading =
            document.createElement('h3');

          heading.textContent =
            item.product;


          const paragraph =
            document.createElement('p');


          const strong =
            document.createElement('strong');

          strong.textContent =
            `₹${item.rate}/${item.unit}`;


          paragraph.appendChild(strong);

          card.appendChild(heading);

          card.appendChild(paragraph);

          ratesSection.appendChild(card);

        });
      }


      // =========================
      // BUTTON
      // =========================

      function updateButton(
        totalItems,
        isSearching
      ) {

        if (!loadMoreButton) {
          return;
        }


        // Search ke time button hide
        if (isSearching) {

          loadMoreButton.style.display =
            'none';

          return;
        }


        // 6 ya usse kam products
        if (
          totalItems <= ITEMS_PER_PAGE
        ) {

          loadMoreButton.style.display =
            'none';

          return;
        }


        loadMoreButton.style.display =
          'block';


        if (
          visibleCount >= totalItems
        ) {

          loadMoreButton.textContent =
  '⌃ Show Less';

} else {

  loadMoreButton.textContent =
    '⌄ View More Rates';

}
      }


      // =========================
      // UPDATE RATES
      // =========================

      function updateRates() {

        const searchTerm =
          searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : '';


        // SEARCH MODE
        if (searchTerm !== '') {

          const filteredItems =
            allRateItems.filter(item =>
              item.product
                .toLowerCase()
                .includes(searchTerm)
            );


          renderRates(filteredItems);

          updateButton(
            filteredItems.length,
            true
          );

          return;
        }


        // NORMAL MODE
        const itemsToShow =
          allRateItems.slice(
            0,
            visibleCount
          );


        renderRates(itemsToShow);


        updateButton(
          allRateItems.length,
          false
        );
      }


      // =========================
      // SEARCH
      // =========================

      if (searchInput) {

        searchInput.addEventListener(
          'input',
          () => {

            visibleCount =
              ITEMS_PER_PAGE;

            updateRates();

          }
        );

      }


      // =========================
      // VIEW MORE / SHOW LESS
      // =========================

      if (loadMoreButton) {

        loadMoreButton.addEventListener(
          'click',
          () => {


            // SHOW LESS
            if (
              visibleCount >=
              allRateItems.length
            ) {

              visibleCount =
                ITEMS_PER_PAGE;

              updateRates();


              const ratesSectionElement =
                document.querySelector('#rates');


              if (ratesSectionElement) {

                ratesSectionElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });

              }


              return;
            }


            // VIEW MORE
            visibleCount =
              allRateItems.length;


            updateRates();

          }
        );

      }


      // FIRST LOAD
      updateRates();

    })


    .catch(error => {

      console.log(
        'Rates could not be loaded:',
        error
      );

    });



  // =========================
  // STORE OPEN / CLOSED
  // =========================

  function updateStoreStatus() {

    const statusElement =
      document.querySelector('#store-status');


    if (!statusElement) {
      return;
    }


    const now =
      new Date();


    const currentTime =
      now.getHours() * 60 +
      now.getMinutes();


    const month =
      now.getMonth() + 1;


    let openingTime =
      6 * 60;


    let closingTime;


    // October to March = Winter
    if (
      month >= 10 ||
      month <= 3
    ) {

      closingTime =
  20 * 60 + 30;

} else {

  closingTime =
    21 * 60 + 30;

    }


    if (
      currentTime >= openingTime &&
      currentTime < closingTime
    ) {

      statusElement.innerHTML =
        `🟢 <strong>OPEN NOW</strong><br>
        <span>Closes at ${
          closingTime === 21 * 60 + 30
  ? '9:30 PM'
  : '8:30 PM'
        }</span>`;

    } else {

      statusElement.innerHTML =
        '🔴 <strong>CLOSED NOW</strong>';

    }

  }


  updateStoreStatus();


  setInterval(
    updateStoreStatus,
    60000
  );

}); // =========================
// AUTOMATIC FESTIVAL BANNER
// =========================

(function () {

  const banner = document.querySelector('#festival-banner');
  const icon = document.querySelector('#festival-icon');
  const small = document.querySelector('#festival-small');
  const title = document.querySelector('#festival-title');
  const message = document.querySelector('#festival-message');

  if (!banner || !icon || !small || !title || !message) {
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  let festival = null;
  
  // Republic Day
  if (month === 1 && day === 26) {
    festival = {
      icon: '🇮🇳',
      small: 'REPUBLIC DAY',
      title: 'Happy Republic Day!',
      message: 'Warm wishes from ABHI KARIYANA STORE.'
    };
  }

  // Holi — 2026: March 4
  else if (year === 2026 && month === 3 && day === 4) {
    festival = {
      icon: '🌈',
      small: 'HAPPY HOLI',
      title: 'Happy Holi!',
      message: 'Wishing you and your family a colourful and joyful Holi.'
    };
  }

  // Independence Day
  else if (month === 8 && day === 15) {
    festival = {
      icon: '🇮🇳',
      small: 'INDEPENDENCE DAY',
      title: 'Happy Independence Day!',
      message: 'Warm wishes from ABHI KARIYANA STORE.'
    };
  }

  // Dussehra — 2026: October 20
  else if (year === 2026 && month === 10 && day === 20) {
    festival = {
      icon: '🏹',
      small: 'HAPPY DUSSEHRA',
      title: 'Happy Dussehra!',
      message: 'Wishing you happiness, peace and prosperity.'
    };
  }

  // Diwali — 2026: November 8
  else if (year === 2026 && month === 11 && day === 8) {
    festival = {
      icon: '🪔',
      small: 'HAPPY DIWALI',
      title: 'Happy Diwali!',
      message: 'Wishing you and your family happiness, health and prosperity.'
    };
  }

  // New Year
  else if (month === 1 && day === 1) {
    festival = {
      icon: '🎉',
      small: 'HAPPY NEW YEAR',
      title: 'Happy New Year!',
      message: 'Warm wishes from ABHI KARIYANA STORE.'
    };
  }

  // Show festival banner only on festival days
  if (festival) {

    icon.textContent = festival.icon;
    small.textContent = festival.small;
    title.textContent = festival.title;
    message.textContent = festival.message;

  } else {

    banner.style.display = 'none';

  }

})();
// ===============================
// LAST UPDATED DATE
// ===============================
fetch('https://api.github.com/repos/abhisheksoni680/abhikariyanastore.github.io/commits?per_page=1')
  .then(response => response.json())
  .then(data => {
    if (data && data[0] && data[0].commit) {
      const date = new Date(data[0].commit.committer.date);

      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };

      const formattedDate = date.toLocaleDateString('en-IN', options);

      const lastUpdated = document.getElementById('last-updated');

      if (lastUpdated) {
        lastUpdated.textContent = formattedDate;
      }
    }
  })
  .catch(() => {
    const lastUpdated = document.getElementById('last-updated');

    if (lastUpdated) {
      lastUpdated.textContent = 'Recently updated';
    }
  });
// ===============================
// CUSTOMER REQUEST FORM
// ===============================

const customerRequestForm =
  document.getElementById('customer-request-form');

if (customerRequestForm) {
  customerRequestForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const requestInput =
      document.getElementById('customer-request');

    const message =
      document.getElementById('request-message');

    const submitButton =
      customerRequestForm.querySelector('button[type="submit"]');

    const request =
      requestInput.value.trim();

    if (!request) {
      message.textContent = 'Please enter your request.';
      return;
    }

    const webAppUrl =
      'https://script.google.com/macros/s/AKfycbzi51hedqYfN174zdAJ3xAycvOvbTmdFHMyVEmvELVCtChOw7rXZzElOtJAMczAibQb/exec';

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        body: JSON.stringify({
          request: request
        })
      });

      requestInput.value = '';

      message.textContent =
        '✓ Request submitted successfully! Thank you.';

      message.style.color = '#0b6b45';

      setTimeout(function () {
        message.textContent = '';
      }, 2000);

    } catch (error) {

      message.textContent =
        'Something went wrong. Please try again.';

      message.style.color = '#b00020';

    } finally {

      submitButton.disabled = false;
      submitButton.textContent = 'Submit Request';

    }
  });
}