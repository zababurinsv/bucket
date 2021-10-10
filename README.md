# Test
Задание
```text
Получить данные из файла data.json и вывести их на страницу как это показано на рис."пример.png".

Показанные на рисунке параметры находятся в узле Goods. "C" - цена в долларах(USD) - вывести в рублях(курс выбрать произвольно), "G" - id группы, "T" - id товара, "P" - сколько единиц товара осталось (параметр, который указан в скобках в названии).

Сопоставления id групп и товаров с их названиями находятся в файле names.json.

После вывода данных навесить обработчики для добавления выбранного товара в корзину и удаления из нее. Пример корзины показан в файле "Корзина.png". Сделать рассчет общей суммы товаров и вывести отдельным полем.
Корзина находится на одной и той же странице вместе со списком товаров.

(*)
Вывести данные используя привязку к представлению и возможностью последующего изменения (two-way binding). Можно использовать фреймворки. 
Сделать обновление цены товара в зависимости от курса валюты.
С интервалом в 15 секунд читать исходный файл data.json и одновременно менять курс доллара (вручную) на значение от 20 до 80, выполняя обновление данных в модели (с изменением в представлении). Если цена увеличилось в большую сторону - подсветить ячейку красным, если в меньшую - зеленым.

Дополнительная информация: Дизайну, показанному в примерах, следовать не обязательно. Прокомментировать основные действия. Интересные решения приветствуются.
```
## Выбор решения
* Написал на нативном js потому что в задании указанно, что можно использовать фреймворк.(тоесть это не обязательно)
* Мне хотелось написать тестовый проект, в котором, я мог бы использовать `idbfs` и `workerfs`
* Мне хотелось написать тестовый проект, в котором я мог бы попробовать использовать библиотеку `z-events`

### Использование
Проект можно собирать библиотекой `parcel` (в каталоге `docs` на гитхабе собран бандл), 
а так же для запуска можно использовать сервер, написанный с использованием `express`
Но для этого надо динамически подключить библиотеку `z-events`, а не из `node_modules`

### Стрктура
В проекте используются модули
* index.mjs
* worker.mjs
* template.mjs
* listener.mjs
* isEmpty.mjs
* cart.mjs
* api.mjs
* back.mjs
* fs

#### index.mjs
Основной модуль, в котором создаётся объект, в котором происходит общение с html страницей
Добавление, удаление редактирование продуктов.
* Добавление продукта происходит при одинарном нажатии на продукт.
* Редактирование продукта происходит при двойном шелчке, в модальном окне. 
  `Модальное окно сделанно с помошью тега <dialog>  по этому в браузере safari работать не будет.
```jsx
<dialog class="window_modal">
    <div class="window_modal_edit"></div>
    <div class="window_modal_panel">
        <button class="window_modal_save">Сохранить</button>
        <button class="window_modal_close">Не сохранять</button>
    </div>
</dialog>
```
Все шаблоны вынесены в `<template>`
```jsx

<template id="product">
    <details class="-products__container-item" open="open">
        <summary>Group</summary>
        <div class="-products__container-item__details"></div>
    </details>
</template>

<template id="product-item">
        <div class="-products__container-item__details_item">
            <div class="-products__container-item__details_item_wrapper">
                <div class="-products__container-item__details_item_name">
                    test
                </div>
                <span class="-products__container-item__details_item_available">4</span>
            </div>
            <div class="-products__container-item__details_item_price">0</div>
            <div class="-products__container-item__details_item_id" style="display: none"></div>
            <div class="-products__container-item__details_item_price-usd" style="display: none"></div>
            <div class="-products__container-item__details_item_group" style="display: none"></div>
        </div>
</template>

<template id="cart-item">
    <div class="-cart__container_item">
        <div class="-cart__container_item_name"></div>
        <div class="-cart__container_item_quantity"></div>
        <div class="-cart__container_item_price"></div>
        <div class="-cart__container_item_remove">Удалить</div>
        <div class="-cart__container_item_groupId" style="display: none"></div>
        <div class="-cart__container_item_productId" style="display: none"></div>
        <div class="-cart__container_item_price-usd" style="display: none"></div>
    </div>
</template>

<template id="modal-window">
    <h3>Отредактируйте значение поля</h3>
    <div class="modal-window_value">
        <div class="modal-window-value_old">
            <h4>Старое значение</h4>
        </div>
        <div class="modal-window-value_new_wrapper">
            <h4>Новое значение</h4>
            <textarea class="modal-window-value_new"></textarea>
        </div>
    </div>
</template>
```
* Обновление курса происходит в цикле. Можно было сделать вне цикла, для этого достаточно сообщение послать, 
 но в реальном проекте, данные должны приходить с бека.
* Обновление корзины и данных о продукте происходит вне цикла. 
```jsx
self.onmessage = async (events) => {
  switch (events.data.type) {
    case 'update-product':
      isSend = false
      await product.update(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    case 'update':
      isSend = events.data.isSend
      break
    case 'change-course':
      isSend = false
      course = await ApiBack.set.course(events.data.course)
      isSend = true
      break
    case 'reset-change':
      isSend = false
      await ApiBack.reset.courseChange()
      isSend = true
      break
    case 'add-cart':
      isSend = false
      await cart.add(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    case 'remove-from-cart':
      isSend = false
      await cart.remove(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    default:
      console.warn('неопределён тип события', events.data)
      break
  }
}
```
#### Worker.mjs
Это хранилище (аналог store в vue).
Обращение к условному бэкенду происходит там.
* Когда приходят какие то действия,  в воркер, отправка сообщений блокируется, до того момента, пока действие не будет завершенно.
 За это отвечает свойство `isSend`
* Данные из json получаются только один раз. После этого объект записывается в store и данные берутся оттуда.
```jsx
  if(isSend) {
    store.products = (isEmpty(store.products))
      ? await ApiBack.get.products()
      : await ApiBack.get.store(store.products)
    store.cart = await ApiBack.get.cart(store.cart)
    self.postMessage({
      type: 'products',
      tick: count,
      isSend: isSend,
      data: store.products,
      cart: store.cart,
      course: course
    });
  }
```

