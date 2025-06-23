document.addEventListener('DOMContentLoaded', () => {
    // --- Animação de entrada para os elementos do card ---
    const animatedElements = document.querySelectorAll('.link-list li, .contact-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'none';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }, index * 120);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- Lógica para o fundo de chuva digital (Matrix) ---
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    // Ajusta o tamanho do canvas para a tela inteira
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Caracteres binários para a chuva
    const binary = '01';
    const fontSize = 16;
    const columns = canvas.width / fontSize; // Número de colunas para a chuva

    // Array para armazenar a posição Y de cada gota em cada coluna
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    // Função para desenhar a chuva digital
    function draw() {
        // Fundo preto semi-transparente para criar o efeito de rastro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0'; // Cor verde para os caracteres
        ctx.font = fontSize + 'px monospace';

        // Loop através das colunas
        for (let i = 0; i < drops.length; i++) {
            // Pega um caractere binário aleatório
            const text = binary.charAt(Math.floor(Math.random() * binary.length));
            // Desenha o caractere na sua posição
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Envia a gota de volta para o topo de forma aleatória quando ela sai da tela
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Incrementa a posição Y da gota para fazê-la cair
            drops[i]++;
        }
    }

    // Inicia a animação, chamando a função draw a cada 33ms (~30 FPS)
    setInterval(draw, 33);

    // Ajusta o canvas se a janela for redimensionada
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Recalcula o número de colunas e reinicia as gotas
        const newColumns = canvas.width / fontSize;
        drops.length = 0;
        for (let x = 0; x < newColumns; x++) {
            drops[x] = 1;
        }
    });
});