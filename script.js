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

  const ITEMS_PER_PAGE = 6;

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
            '➖ Show Less';

        } else {

          loadMoreButton.textContent =
            '➕ View More Rates';

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
            visibleCount +=
              ITEMS_PER_PAGE;


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
        21 * 60 + 30;

    } else {

      closingTime =
        22 * 60;

    }


    if (
      currentTime >= openingTime &&
      currentTime < closingTime
    ) {

      statusElement.innerHTML =
        `🟢 <strong>OPEN NOW</strong><br>
        <span>Closes at ${
          closingTime === 22 * 60
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

});