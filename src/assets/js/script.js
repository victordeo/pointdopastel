document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const checkoutBtn = document.getElementById("checkout-btn");
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    const cartBtn = document.getElementById("cart-btn");
    const addressInput = document.getElementById("address");
    const deliveryInfo = document.getElementById("delivery-info");
    const addressError = document.getElementById("address-error");

    const accessToken = 'pk.eyJ1IjoiMHJpb24iLCJhIjoiY21hdjZxcG0wMDFjODJwcHV2aWt6a2dzaCJ9.zE4zdJTkK6IVvEBseIVVxw'; // Substitua pela sua chave Mapbox
    const enderecoLoja = 'R. Frei Frederico Vier, 167 B - Posse, Nova Iguaçu - RJ, 26022-830'; // Endereço da loja

    let cart = [];
    let taxaEntrega = 0;

    function formatCurrency(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        cart.forEach((item) => {
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

        const totalComEntrega = total + taxaEntrega;
        cartTotal.textContent = formatCurrency(totalComEntrega);
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

    async function geocodificar(endereco) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json?access_token=${accessToken}`;
        const resp = await fetch(url);
        const dados = await resp.json();
        return dados.features[0]?.center;
    }

    async function calcularTaxaEntrega(enderecoCliente) {
        const origem = await geocodificar(enderecoLoja);
        const destino = await geocodificar(enderecoCliente);
        if (!origem || !destino) throw new Error("Endereço inválido");

        const rotaUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origem[0]},${origem[1]};${destino[0]},${destino[1]}?access_token=${accessToken}`;
        const rotaResp = await fetch(rotaUrl);
        const rotaDados = await rotaResp.json();

        const rota = rotaDados.routes[0];
        const distanciaKm = rota.distance / 1000;
        const tempoMin = rota.duration / 60;

        let taxa = 0;

        if (distanciaKm <= 0.5) {
            taxa = 3.00;
        } else if (distanciaKm <= 3) {
            taxa = 4.00;
        } else if (distanciaKm <= 4.5) {
            taxa = 5.00;
        } else if (distanciaKm <= 5) {
            taxa = 6.00;
        } else if (distanciaKm <= 6) {
            throw new Error("Não realizamos entregas acima de 5km.");
        } else {
            throw new Error("Fora da área de entrega. Limite: 6km.");
        }

        return {
            distanciaKm: distanciaKm.toFixed(2),
            tempoMin: tempoMin.toFixed(0),
            taxa: parseFloat(taxa.toFixed(2))
        };
    }

    let typingTimer;
    addressInput.addEventListener("input", () => {
        clearTimeout(typingTimer);
        if (addressInput.value.length < 5) {
            deliveryInfo.textContent = "";
            addressError.classList.add("hidden");
            checkoutBtn.disabled = true;
            return;
        }

        typingTimer = setTimeout(async () => {
            try {
                deliveryInfo.textContent = "Calculando taxa de entrega...";
                addressError.classList.add("hidden");

                const { distanciaKm, tempoMin, taxa } = await calcularTaxaEntrega(addressInput.value);
                taxaEntrega = taxa;
                deliveryInfo.innerHTML = `Total Taxa de Entrega: ${formatCurrency(taxa)}`;
                checkoutBtn.disabled = false;
                updateCart();
            } catch (err) {
                deliveryInfo.textContent = "";
                taxaEntrega = 0;
                updateCart();

                addressError.textContent = err.message;
                addressError.classList.remove("hidden");
                checkoutBtn.disabled = true;
            }
        }, 1000);
    });

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
        const address = addressInput.value;
        if (!address) {
            alert("Por favor, insira o endereço de entrega!");
            return;
        }

        let orderDetails = `Pedido\n\nProdutos\n`;
        let subtotal = 0;

        cart.forEach(item => {
            orderDetails += `${item.name} ${item.quantity}x ${formatCurrency(item.price)}\n`;
            orderDetails += `Observação: ${item.observation || "Sem observação"}\n`;
            subtotal += item.price * item.quantity;
        });

        const total = subtotal + taxaEntrega;

        orderDetails += `\nEndereço de entrega:\n${address}\n`;
        orderDetails += `\nTaxa de entrega: ${formatCurrency(taxaEntrega)}`;
        orderDetails += `\nTotal: ${formatCurrency(total)}`;

        const whatsappNumber = '5521965667947';
        const whatsappMessage = encodeURIComponent(orderDetails);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

        window.open(whatsappLink, '_blank');

        cart = [];
        taxaEntrega = 0;
        updateCart();
        cartModal.classList.add("hidden");
        addressInput.value = "";
        deliveryInfo.textContent = "";
        addressError.classList.add("hidden");
        showToast("Pedido finalizado com sucesso! Você será redirecionado para o WhatsApp.");
    });
});
