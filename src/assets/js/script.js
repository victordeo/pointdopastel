document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const checkoutBtn = document.getElementById("checkout-btn");
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    const cartBtn = document.getElementById("cart-btn");

    let cart = [];

    function formatCurrency(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        cart.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("flex", "justify-between", "items-center", "mb-1");

            const itemText = document.createElement("p");
            itemText.classList.add("flex", "items-center", "text-medium", "font-semibold", "text-gray-700");
            itemText.innerHTML = `${item.name} x${item.quantity} ${formatCurrency(item.price)}`;
            itemDiv.appendChild(itemText);

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remover";
            removeBtn.classList.add("text-red-600", "cursor-pointer", "ml-4", "font-medium");
            removeBtn.addEventListener("click", () => removeOneFromCart(item.name));
            itemDiv.appendChild(removeBtn);

            cartItems.appendChild(itemDiv);

            const observationInput = document.createElement("input");
            observationInput.type = "text";
            observationInput.placeholder = "Observação para este item";
            observationInput.classList.add("mb-4", "mt-0", "p-2", "border", "border-gray-200", "w-full", "rounded", "text-sm", "font-light", "text-gray-500");
            observationInput.addEventListener("input", (e) => {
                item.observation = e.target.value;
            });

            cartItems.appendChild(observationInput);

            total += item.price * item.quantity;
            itemCount += item.quantity;
        });

        cartTotal.textContent = formatCurrency(total);
        cartCount.textContent = itemCount;
    }

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1, observation: "" });
        }
        updateCart();
        showToast(`${name} adicionado ao carrinho!`);
    }

    function removeOneFromCart(name) {
        const item = cart.find(item => item.name === name);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item.name !== name);
            }
        }
        updateCart();
    }

    function showToast(message) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#16a34a",
        }).showToast();
    }

    addToCartButtons.forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(name, price);
        });
    });

    cartBtn.addEventListener("click", () => {
        cartModal.classList.remove("hidden");
    });

    closeModalBtn.addEventListener("click", () => {
        cartModal.classList.add("hidden");
    });

    window.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            cartModal.classList.add("hidden");
        }
    });

    checkoutBtn.addEventListener("click", () => {
        const address = document.getElementById("address").value;
        if (!address) {
            alert("Por favor, insira o endereço de entrega!");
        } else {
            let orderDetails = `Pedido\n\nProdutos\n`;
            let total = 0;

            cart.forEach(item => {
                orderDetails += `${item.name} ${item.quantity}x ${formatCurrency(item.price)}\n`;
                if (item.observation) {
                    orderDetails += `Observação: ${item.observation}\n`;
                } else {
                    orderDetails += `Observação: Sem observação\n`;
                }
                total += item.price * item.quantity;
            });

            orderDetails += `\nEndereço de entrega\n${address}\n`;
            const deliveryFee = 3.00;
            orderDetails += `\nEntrega\n${formatCurrency(deliveryFee)}\n`;

            const finalTotal = total + deliveryFee;
            orderDetails += `\nTotal\n${formatCurrency(finalTotal)}`;

            const whatsappNumber = '5521965667947';
            const whatsappMessage = encodeURIComponent(orderDetails);

            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

            window.open(whatsappLink, '_blank');

            cart = [];
            updateCart();

            cartModal.classList.add("hidden");
            document.getElementById("address").value = "";
            showToast("Pedido finalizado com sucesso! Você será redirecionado para o WhatsApp.");
        }
    });
});