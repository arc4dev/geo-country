'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const main = document.querySelector('.container');

////////////////////////////////

const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const getJSON = url => {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`Country not found (${res.status})`);

    return res.json();
  });
};

const showCountry = (data, className = '') => {
  const [country] = data;

  const html = `
    <article class="country ${className}" data-name="${country.name.common}">
      <img class="country__img" src="${country.flags.svg}"  alt ="" />
      <div class="country__data">
        <h3 class="country__name">${country.name.common}</h3>
        <h4 class="country__region">${country.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +country.population / 1000000
        ).toFixed(2)}M people</p>
        <p class="country__row"><span>🌍</span>${(+country.area / 1000).toFixed(
          3
        )} km&#178;</p>
        <p class="country__row"><span>🗣️</span>${
          Object.values(country.languages)[0]
        }</p>
        <p class="country__row"><span>💰</span>${
          Object.keys(country.currencies)[0]
        }</p>
        <div class="country__data country__data--overlay">
          <p class="country__row"><span>🗣️</span>${
            Object.values(country.languages)[0]
          }</p>
          <p class="country__row"><span>🗣️</span>${
            Object.values(country.languages)[0]
          }</p>
          <p class="country__row"><span>🗣️</span>${
            Object.values(country.languages)[0]
          }</p>
        </div>
      </div>
    </article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const whereAmIasync = async () => {
  try {
    // 1. Get a position
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    // 2. Use that to reverse geocoding the coords (it returns location object)
    const res = await fetch(
      `https://geocode.xyz/${lat},${lng}?geoit=json&auth=231194208812949415396x121573`
    );
    if (!res.ok) throw new Error('Could not get your location!');

    const data = await res.json();

    // 3. Find a country
    const resCountry = await fetch(
      `https://restcountries.com/v3.1/name/${data.country}`
    );
    if (!res.ok) throw new Error('Could not get the country');

    const dataCountry = await resCountry.json();

    // 4. Show a country (UI)
    showCountry(dataCountry);
    const [country] = dataCountry;

    // 5. Promise all borders countries and
    // display them (UI)
    const promises = [];

    country.borders.forEach(border => {
      promises.push(getJSON(`https://restcountries.com/v3.1/alpha/${border}`));
    });

    const allNeigbours = await Promise.all(promises);
    allNeigbours.forEach(n => {
      showCountry(n, 'neighbour');
    });

    // 6. Disable button
    btn.style.display = 'none';
  } catch (err) {
    alert(err.message);
  }
  //Fade out
  main.style.paddingTop = '5%';
  setTimeout(() => {
    countriesContainer.style.opacity = 1;
  }, 150);
};

btn.addEventListener('click', whereAmIasync);
