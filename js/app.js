$(document).ready(function(){
    cardapio.eventos.init();
})

var cardapio ={};
var MEU_CARRINHO = [];

cardapio.eventos = {
    init:() => {
       cardapio.metodos.obterItensCardapio();
    }
}

cardapio.metodos = {
    //Obtem as lista de itens do cardapio
    obterItensCardapio:(categoria = 'burgers', vermais = false) => {
        
        var filtro = MENU[categoria];
        console.log(filtro);

        if(!vermais){
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }

        

        $.each(filtro,(i, e) => {
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${id}/g, e.id)

            //Botão Ver mais
            if(vermais && i >= 8 && i < 12){
                $("#itensCardapio").append(temp)
            }

            //Paginação inicial
            if(!vermais && i < 8){
                $("#itensCardapio").append(temp)
            }

        })
        //Remove o active
        $(".container-menu a").removeClass('active');

        //Deixa o botão ativo
        $("#menu-" + categoria).addClass('active')
    },

    //Clique botão ver mais
    verMais:() =>{

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo,true);

        $("#btnVerMais").addClass('hidden');
    },

    //diminui a quantidade no cardapio
    dinimuirQuantidade:(id)=>{
        let qntdAtual = parseInt($("#qntd-" + id).text());
        if(qntdAtual > 0){
            $("#qntd-" + id).text(qntdAtual - 1)
        }
    },

    //aumentar a quantidade no cardapio
    aumentarQuantidade:(id) =>{
        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)
    },

    //Adicionando ao carrinho o item do cardapio
    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
        if(qntdAtual > 0){
            //obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
            //obter a lista de item
            let filtro = MENU[categoria];
            
            //Obter o item
            let item = $.grep(filtro,(e, i)=> {return e.id == id});

            if(item.length > 0){
                //Valida se existe este item no carrinhho
                let existe = $.grep(MEU_CARRINHO,(elem, index)=> {return elem.id == id});

                //caso existe o item no carrinho so altera a quantidade
                if(existe.length > 0){
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }else{
                    //Caso nao existe o item no carrinho add
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho','green')
                $("#qntd-" + id).text(0)

                cardapio.metodos.atualizarBadgeTotal();

            }

        }
    },

    //Atualiza o badge de total de botoes meu carriho
    atualizarBadgeTotal : () => {
        var total = 0;

        //soma os totais do carrinjo
        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if(total > 0){
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
            
        }else{
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

            $(".badge-total-carrinho").html(total);
                
    },

    //Abrir modal carrinho
    abrirCarrinho:(abrir) => {
        if(abrir){
            $('#modal-carrinho').removeClass('hidden');
        }else{
            $('#modal-carrinho').addClass('hidden');
        }
    },





    //Tamplete de mensagem
    mensagem: (texto, cor = 'red', tempo = 3500) =>{

        let id = Math.floor(Date.now() * Math.random()).toString();//Criando ID que nao se repita e aleatorio
        
        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        //removendo a mensagem
        setTimeout(()=> {
            $("#msg-" + id).removeClass('fadeInDown')
            $("#msg-" + id).addClass('fadeOutUp')
          setTimeout(() => {
            $("#msg-" + id).remove(); 
          },800)
        },tempo)

    }

}

cardapio.templates = {
    item:`
    <div class="col-3 mb-5">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}">
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${name}</b>
            </p>
            <p class="price-produto text-center">
                <b>R$ \${price}</b>
            </p>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.dinimuirQuantidade('\${id}')"><i class="fa fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fa fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-cart"></i></span>
            </div>
        </div>
     </div>
    `

}