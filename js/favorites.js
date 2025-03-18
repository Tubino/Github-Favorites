// Utilizando a API do Github para buscar os dados
import { GithubUser } from "./GithubUser.js";


// Classe que vai conter a lógica dos dados, como os dados serão estruturados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();

    }

    load() {
        this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
    }

    save() {
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username);
            if (userExists) {
                throw new Error("Usuário já cadastrado!");
            }


            const user = await GithubUser.search(username);
            
            if (user.login === undefined) {
                throw new Error("Usuário não encontrado!");
            }

            // Spread operator (espalha os dados), 
            // espalha os dados do usuário e adiciona ao array
            this.entries = [user, ...this.entries];
            this.update();
            this.save();

        } catch(error) {
            alert(error.message);
        }
       
    }

    delete(user) {
        // Higher order function (Função que recebe uma função como parâmetro)
        const filteredEntries = this.entries
        .filter(entry => entry.login !== user.login);

        this.entries = filteredEntries;
        this.update();
        this.save();

    }
}

// Classe que vai criar a visualição e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector("table tbody");

        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector(".search button");
        const input = this.root.querySelector(".search input");
        
        const addUser = () => {
            const { value } = input;
            if (value.trim() !== "") {
                this.add(value);
                input.value = ""; // Limpa o input após adicionar o usuário
            }  // .trim() remove espaços em branco antes de validar o input.
        };

        addButton.onclick = addUser;

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                addUser();
            }
        })
    }

    update() {
        this.removeAllTr();
        
        this.entries.forEach( user => {
            const row = this.createRow();
            
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user img').alt = `Imagem de perfil do ${user.name}`;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user span').textContent = `/${user.login}`;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?');
                if (isOk) {
                    this.delete(user);
                } 
            }
                

            this.tbody.append(row);
        })

        this.toggleEmptyMessage();
    }

    toggleEmptyMessage() {
        // Verifica se a lista de favoritos está vazia
        if (this.entries.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.id = 'swap';
    
            const td = document.createElement('td');
            td.colSpan = 4;  // Definindo o colspan para ocupar as 4 colunas
            const div = document.createElement('div');
            div.classList.add('empty-message');
    
            const img = document.createElement('img');
            img.src = './assets/Estrela.svg';
            img.alt = 'Imagem de uma estrela';
    
            const span = document.createElement('span');
            span.textContent = 'Nenhum Favorito Ainda';
    
            // Monta a estrutura
            div.appendChild(img);
            div.appendChild(span);
            td.appendChild(div);
            emptyRow.appendChild(td);
    
            // Adiciona a linha ao <tbody> se não houver nenhum favorito
            if (!this.root.querySelector("#swap")) {
                this.tbody.appendChild(emptyRow);
            }

            
        } else {
            // Verifica se a linha já foi inserida e remove
            const emptyRow = this.root.querySelector("#swap");
            if (emptyRow) {
                emptyRow.remove();
            }
        }
    }

    createRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <tr>
            <td class="user">
                <img src="https://github.com/Tubino.png" alt="Imagem de perfil do Lucas">
                <a href="https://github.com/Tubino" target="_blank">
                    <p>Lucas Tubino</p>
                    <span>Tubino</span>
                </a>
            </td>
            <td class="repositories">
                13
            </td>
            <td class="followers">
                16
            </td>
            <td>
                <button class="remove">Remover</button>
            </td>
        </tr>
    `

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll("tr")
            .forEach((tr) => {
                tr.remove();
            })
    }
    
}