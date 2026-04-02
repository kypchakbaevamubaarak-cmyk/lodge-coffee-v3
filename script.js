// 1. Настройка подключения
const supabaseUrl = 'https://lsgdlgkgsxtmzcnjpvyu.supabase.co';
const supabaseKey = 'sb_publishable_y4TZ8RDyvCIrco1lgHbZdA_rCLUxFys';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    // Находим поле ввода
    const phoneElement = document.getElementById('custPhone');
    
    // Настройки маски
    const maskOptions = {
      mask: '+{996} (000) 000-000'
    };
    
    // Инициализируем маску
    const mask = IMask(phoneElement, maskOptions);
});

// 2. Функция переключения вкладок (категорий)
function showCategory(category) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.style.display = 'none');
    
    const active = document.getElementById(category);
    if (active) {
        active.style.display = 'block';
    }
}

// 3. Функция оформления заказа (отправка в базу)
let currentItem = ""; // Переменная для хранения названия выбранного товара

// 1. Открыть окно оформления
async function orderItem(itemName) {
    currentItem = itemName;
    document.getElementById('modalProductName').innerText = `Товар: ${itemName}`;
    document.getElementById('orderModal').style.display = 'block';
}

// 2. Закрыть окна
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// 3. Логика кнопки "Подтвердить заказ"
document.getElementById('confirmOrderBtn').onclick = async function() {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;

    if (!name || !phone) {
        alert("Пожалуйста, заполните все поля!");
        return;
    }

    // Отправка в Supabase
    const { data, error } = await _supabase
        .from('orders')
        .insert([{ 
            product_name: currentItem, 
            customer_name: name, 
            customer_phone: phone,
            status: 'new'
        }]);

    if (error) {
        alert("Ошибка при отправке. Проверьте таблицу 'orders'.");
    } else {
        // Закрываем окно оформления и открываем окно успеха
        closeModal();
        document.getElementById('successMessage').innerText = `${name}, мы начали готовить ваш ${currentItem}!`;
        document.getElementById('successModal').style.display = 'block';
        
        // Очищаем поля формы
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
    }
};

// Закрытие при клике вне окна
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const successModal = document.getElementById('successModal');
    if (event.target == orderModal) closeModal();
    if (event.target == successModal) closeSuccessModal();
}

// 4. Функция для загрузки меню из базы
async function loadMenu() {
    const { data, error } = await _supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Ошибка загрузки меню:', error);
        return;
    }

    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    // Очищаем контейнер перед загрузкой (если нужно)
    menuContainer.innerHTML = '';

    data.forEach(item => {
        let categoryBlock = document.getElementById(item.category);

        if (!categoryBlock) {
            categoryBlock = document.createElement('div');
            categoryBlock.className = 'category';
            categoryBlock.id = item.category;
            
            // По умолчанию показываем только кофе
            categoryBlock.style.display = (item.category === 'coffee') ? 'block' : 'none';

            categoryBlock.innerHTML = `
                <h2>${item.category_name}</h2>
                <div class="items"></div>
            `;
            menuContainer.appendChild(categoryBlock);
        }

        const itemsContainer = categoryBlock.querySelector('.items');
        itemsContainer.innerHTML += `
            <div class="item">
                <img src="${item.image_url}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.price} сом</p>
                <button onclick="orderItem('${item.name}')">Заказать</button>
            </div>
        `;
    });
}

// 5. Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});