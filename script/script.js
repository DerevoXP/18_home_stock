let db; // объявляем переменную, которая будет датабазой

try {
    db = openDatabase('huw5', '1.0', 'Test DB', 2 * 1024 * 1024); // задаём характеристики датабазы
} catch {
    alert('Ошибка! В вашем браузере не стоит WebSQL! Попробуйте загрузить Google Chrome с официального сайта и пользоваться впредь исключительно этим браузером.'); // проверка на то, поддерживает ли браузер клиента WebSQL
};

// удаляем таблицу магазина

let dropGoodTable = `drop table good`;

document.getElementById('dropTableForGoods').addEventListener('click', () => dropGoodTables());

function dropGoodTables() {
    v_closeView();
    db.transaction(function (tx) {
        tx.executeSql(
            dropGoodTable,
            [],
            () => document.getElementById('developConsole').innerText = 'Таблица магазина успешно угроблена. Можно создавать заново и заполнять велосипедами.',
            () => document.getElementById('developConsole').innerText = 'Удалить таблицу магазина почему-то не удалось.'
        );
    });
    selectAllGood();
};

// удаляем корзину

let dropCart = `drop table customerCart`;

document.getElementById('dropTableForCart').addEventListener('click', () => dropCustomerCart());

function dropCustomerCart() {
    v_closeView();
    selectAllGood();
    db.transaction(function (tx) {
        tx.executeSql(
            dropCart,
            [],
            () => document.getElementById('developConsole').innerText = 'Корзина успешно удалена вместе со всеми товарами.',
            () => document.getElementById('developConsole').innerText = 'Удалить корзину почему-то не удалось. Возможно, она и не существовала? Задумайтесь!'
        );
    });
};

// удаляем товар по ID (странно, но числовые значения отрабатывают как success, даже если позиция не существует в таблице)

document.getElementById('dropGoodOntoMagasine').addEventListener('click', () => dropGoodOntoMagasine());

function dropGoodOntoMagasine() {
    v_closeView();
    let deleteGoodId = document.forms.goodDeleter.elements.three.value;
    let goodDeleterFromId = `delete from good where id=${deleteGoodId}`;
    db.transaction(function (tx) {
        tx.executeSql(
            goodDeleterFromId,
            [],
            () => document.getElementById('developConsole').innerText = `Товар с ID = ${deleteGoodId} уже не существует (зацените хитрожопость формулировки!).`,
            () => document.getElementById('developConsole').innerText = 'Не удалось удалить товар из магазина. Возможно, вместо ID вы ввели какую-то фигню, а возможно не ввели ничего.'
        );
    });
    selectAllGood();
};

// создаём пустую таблицу магазина

let goodCreate = ` 
    create table good(
       id integer primary key autoincrement,
       title varchar(255),
       description varchar(1024)
    )`;

document.getElementById('addTableForGoods').addEventListener('click', () => addMagasine());

function addMagasine() {
    v_closeView();
    db.transaction(function (tx) {
        tx.executeSql(
            goodCreate,
            [],
            () => document.getElementById('developConsole').innerText = 'Магазин создан и он пока пуст.',
            () => document.getElementById('developConsole').innerText = 'Не удалось создать магазин. Возможно, вашего стартового капитала не достаточно. А возможно, он уже существует.'
        );
    });
};

// добавляем велосипеды, или что там у нас в форме прописано

let goodInsert = 'insert into good(title, description) values(?, ?)'; // маска для добавления товара в магазин. Хуй знает, как она работает.

document.getElementById('addGoodIntoMagasine').addEventListener('click', () => addBycicle());

function addBycicle() {

    v_closeView();

    let goodUniqueName = document.forms.goodUniqueName.elements.one.value; // так во-о-от оно, блять, для чего нужны имена в формах и инпутах!...
    let goodUniqueDesc = document.forms.goodUniqueDesc.elements.two.value;

    if (goodUniqueName == '' || goodUniqueDesc == '') {
        db.transaction(function (tx) {
            tx.executeSql(
                goodInsert,
                ['ВЕЛОСИПЕД', 'Полезен для здоровья!'],
                () => document.getElementById('developConsole').innerText = 'Товар (по умолчанию - велосипед) добавлен. Возможно, стоит добавить ещё немного велосипедов?',
                () => document.getElementById('developConsole').innerText = 'Не удалось добавить велосипед. Возможно, стоит сначала создать магазин?'
            );
        });
    } else {
        db.transaction(function (tx) {
            tx.executeSql(
                goodInsert,
                [goodUniqueName, goodUniqueDesc],
                () => document.getElementById('developConsole').innerText = `Ваш товар (${goodUniqueName}) добавлен. Возможно, стоит добавить ещё что-нибудь?`,
                () => document.getElementById('developConsole').innerText = 'Не удалось добавить товар. Хз, почему.'
            );
        });
    };
    selectAllGood();
};

selectAllGood(); // без этого после обновления страницы будет пустой экран

function selectAllGood() {
    document.getElementById('root').innerHTML = ''; // очищаем root перед добавлением нового товара в магазин
    db.transaction(function (tx) {
        tx.executeSql('select * from good;',
            [],
            (tx, response) => renderCards(response.rows),
            () => document.getElementById('developConsole').innerText = 'Для начала создайте магазин!'
        );
    });
};

function renderCards(list) { // визуализируем в HTML карточки товара из таблицы и кнопки для добавления товара в Корзину
    let arr = [...list];
    let containerElem = document.createElement('div');
    containerElem.classList.add('container');

    arr.forEach(function (elem) {
        let cardElem = document.createElement('div');
        cardElem.classList.add('card');

        for (let key in elem) {
            let pElem = document.createElement('p');

            pElem.innerText = elem[key];
            cardElem.appendChild(pElem);
        }
        let btnElem = document.createElement('div');
        btnElem.classList.add('btn');
        btnElem.innerText = 'В корзину!';
        containerElem.appendChild(cardElem);
        cardElem.appendChild(btnElem);
        btnElem.addEventListener('click', () => addGood(elem['id'])); // эта строчка инициализирует добавление товара в Корзину

    });
    document.querySelector('#root').appendChild(containerElem);
};

// создаём пустую корзину

let customerCartCreate = `
        create table customerCart(
            id integer,
            title varchar(255),
            description varchar(1024)
        )`;

document.getElementById('addTableForCart').addEventListener('click', () => initCustomerCart());

function initCustomerCart() {
    v_closeView();
    db.transaction(function (tx) {
        tx.executeSql(customerCartCreate,
            [],
            () => document.getElementById('developConsole').innerText = 'Ваша Персональная Корзина успешно создана!',
            () => document.getElementById('developConsole').innerText = 'Не удалось создать Вашу Персональную Корзину. Возможно, у вас уже есть одна, так на кой вам ляд дополнительная?'
        );
    });
};

// добавляем товары в корзину

function addGood(id) {
    db.transaction(function (tx) {
        tx.executeSql(`
            insert into customerCart(id, title, description)
            select id, title, description
            from good
            where id = ?
            `,
            [id],
            () => document.getElementById('developConsole').innerText = 'Товар добавлен в корзину.',
            () => document.getElementById('developConsole').innerText = 'Не удалось добавить товар в корзину. Возможно, стоит сначала создать саму Корзину.'
        );
    });
};

// создаём вьюшку

document.getElementById('addView').addEventListener('click', () => v_cartCreate());

function v_cartCreate() {
    v_closeView();
    db.transaction(function (tx) {
        tx.executeSql(`
            create view v_cart as
            select
            id,
            title,
            count(id) as cnt
            from customerCart
            group by id 
            `,
            [],
            () => document.getElementById('developConsole').innerText = 'Вьюшка зачем-то создана.',
            () => document.getElementById('developConsole').innerText = 'Вьюшка не создана. Возможно, она была создана ранее и просто не может родиться на бис.'
        );
    });
};

// удаляем вьюшку

document.getElementById('dropView').addEventListener('click', () => v_cartDrop());

function v_cartDrop() {
    v_closeView();
    db.transaction(function (tx) {
        tx.executeSql(
            `drop view v_cart`,
            [],
            () => document.getElementById('developConsole').innerText = 'Вьюшка удалена. Вроде бы.',
            () => document.getElementById('developConsole').innerText = 'Вьюшка не удалена. Скорее всего, она и не существовала в текущем пространственно-временном отрезке. Попробуйте сначала её создать.'
        );
    });
};

// отображаем вьюшку на экране

document.getElementById('showView').addEventListener('click', () => v_cartShov());

function v_cartShov() {
    document.getElementById('cart').style.display = 'initial';
    db.transaction(function (tx) {
        tx.executeSql('select * from v_cart',
            [],
            (tx, response) => renderView(response.rows), // не очень понятен смысл этой строки
            () => document.getElementById('developConsole').innerText = 'Корзина не визуализируется. Либо ваша корзина пуста, либо вьюшка или сама Корзина ещё не созданы.'
        );
    });
};

function renderView(list) {
    document.getElementById('cart').innerHTML = ''; // очищаем cart перед обновлением отображения содержимого корзины
    document.getElementById('cart').innerHTML = '<div id="cartDescript"><div id="cartCrutch"><p>ID Товара</p><p>Наименование</p><p>Количество</p></div></div>';
    document.getElementById('developConsole').innerText = 'Вы просматриваете содержимое своей корзины.'

    let arr = [...list];
    let cartContainerElem = document.createElement('div');
    cartContainerElem.classList.add('cartContainer');

    arr.forEach(function (elem) {
        let cartElem = document.createElement('div');
        cartElem.classList.add('cart');

        let funcCrutch = document.createElement('div');
        funcCrutch.classList.add('funcCrutch');

        let posDeleter = document.createElement('p');
        posDeleter.classList.add('posDeleter');
        posDeleter.innerText = '-';

        let posAdder = document.createElement('p');
        posAdder.classList.add('posAdder');
        posAdder.innerText = '+';

        funcCrutch.appendChild(posDeleter);
        funcCrutch.appendChild(posAdder);

        for (let key in elem) {
            let pElem = document.createElement('p');
            pElem.innerText = elem[key];
            cartElem.appendChild(pElem);
        };
        cartElem.appendChild(funcCrutch);
        cartContainerElem.appendChild(cartElem);
    });
    document.querySelector('#cart').appendChild(cartContainerElem);
    cartPosAdder();
    cartPosDeleter();
};

// удаляем вьюшку с экрана (не из базы)

document.getElementById('closeView').addEventListener('click', () => v_closeView());

function v_closeView() {
    document.getElementById('cart').style.display = 'none';
    document.querySelector('#cart').innerHTML = '';
    document.getElementById('developConsole').innerText = 'Вы просматриваете содержимое магазина.'
};

// добавление позиции в корзину через модальное окно Корзины (плюсик)

function cartPosAdder() {
    let buttonClick = document.getElementsByClassName('posAdder'); // спасибо: https://javascript.ru/forum/misc/63993-getelementsbyclassname-ne-srabatyvaet-na-clicks.html
    for (i = 0; i < buttonClick.length; i++)
        buttonClick[i].onclick = function () {
            addGood(this.parentNode.parentNode.querySelector('p').innerText);
            v_cartShov();
        };
};

// удаление позиции из модального окна корзины (минус)

function cartPosDeleter() {
    let buttonClick = document.getElementsByClassName('posDeleter');
    for (i = 0; i < buttonClick.length; i++)
        buttonClick[i].onclick = function () {

            let delPosition = this.parentNode.parentNode.querySelector('p').innerText;
            let stockCount = this.parentNode.parentNode.querySelectorAll('p')[2].innerText;

            db.transaction(function (tx) {
                tx.executeSql(`delete from customerCart where id = ${delPosition}`);
            });

            for (i = 0; i < stockCount - 1; i++) {
                addGood(this.parentNode.parentNode.querySelector('p').innerText);
            };
            v_cartShov();
        };
};