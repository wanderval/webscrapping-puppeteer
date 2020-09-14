const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

async function writeOnFile(pathFile, content) {
  fs.writeFile(pathFile, JSON.stringify(content, null, 2), err => {
    if(err) throw new Error('something went wrong')

    console.log('well done!')
  });
}

async function screenshoot() {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('https://google.com.br');
  await page.screenshot({path: 'screenshoot/google.png'});

  await browser.close();
}

async function scrapping() {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('https://instagram.com/rocketseat_oficial');
  
  const imageList = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('article img');

    const imageArray = [...nodeList];

    const imageList = imageArray.map(({src}) => ({
      src
    }))

    return imageList;
  });

  writeOnFile('data/instagram.json', imageList);
  await browser.close();
} 

async function scrappingSneakers() {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('https://www.netshoes.com.br/tenis/masculino');
  await page.setViewport({
    width: 1200,
    height: 800
  });

  await page.waitForSelector('.full-mounted-price', { visible: true });
  await sleep(5000);
  await autoScroll(page);
  
  const itemList = await page.evaluate(() => {
    
    const nodeList = document.querySelectorAll('.item-list .item-card');
    const itemArray = [...nodeList];

    const itemList = itemArray.map((item) => {
      const referenceImage = item.querySelector('.item-card__images__image-link img');
      const referenceDescription = item.querySelector('.item-card__description__product-name span');
      const referencePrice = item.querySelector('.full-mounted-price span');

      return {
        src: referenceImage.getAttribute('data-src'),
        title: referenceDescription.textContent,
        price: referencePrice && referencePrice.innerText || null
      }
    })
    
    return itemList;
  });

  writeOnFile('data/netshoes.json', itemList);
  await browser.close();
}

async function scrappingProductMercadoLivre() {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('https://lista.mercadolivre.com.br/joystick');
  await page.setViewport({
    width: 1200,
    height: 800
  });

  await page.waitForSelector('.ui-search-result', { visible: true });
  await sleep(5000);
  await autoScroll(page);
  
  const itemList = await page.evaluate(() => {
    
    const nodeList = document.querySelectorAll('.ui-search-layout .ui-search-layout__item');

    const itemArray = [...nodeList];

    const itemList = itemArray.map((item) => {
      const referenceImage = item.querySelector('.ui-search-layout .ui-search-layout__item img');
      const referenceDescription = item.querySelector('.ui-search-result__content-wrapper .ui-search-item__title');
      const referencePrice = item.querySelector('.ui-search-result__content-wrapper .ui-search-price__part');

      return {
        src: referenceImage.getAttribute('src'),
        title: referenceDescription.textContent,
        price: referencePrice && referencePrice.innerText || null
      }
    })

    return itemList;
  });

  writeOnFile('data/mercadolivre.json', itemList);
  await browser.close();
}

screenshoot();
scrapping();

//challenge
scrappingSneakers();
scrappingProductMercadoLivre();
