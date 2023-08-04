$(document).ready(function(){
    cardapio.eventos.init();
})

var cardapio ={};
var MEU_CARRINHO = [];
var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;
var MEU_ENDERECO = null;
var CELULAR_EMPRESA = '5511984559092'

cardapio.eventos = {
    init:() => {
       cardapio.metodos.obterItensCardapio();
       cardapio.metodos.carregarBotaoReserva();
       cardapio.metodos.carregarBotaoLigar();
       cardapio.metodos.carregaWhatsappConverda();
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
            cardapio.metodos.carregarCarrinho();
        }else{
            $('#modal-carrinho').addClass('hidden');
        }
    },

    //Carrega o texto e exibi os botoes das etapas
    carregarEtapa:(etapa) =>{
        if(etapa == 1){
                $("#lblTituloEtapa").text("Seu carrinho");
                $("#itensCarrinho").removeClass('hidden');
                $("#localEntrega").addClass('hidden');
                $("#resumoCarrinho").addClass('hidden');

                $(".etapa").removeClass('active');
                $(".etapa1").addClass('active');
            

                $("#btnEtapaPedido").removeClass('hidden')
                $("#btnEtapaEndereco").addClass('hidden')
                $("#btnEtapaResumo").addClass('hidden')
                $("#btnVoltar").addClass('hidden')
        }

        if(etapa == 2){
                $("#lblTituloEtapa").text("Endereço de entrega");
                $("#itensCarrinho").addClass('hidden');
                $("#localEntrega").removeClass('hidden');
                $("#resumoCarrinho").addClass('hidden');

                $(".etapa").removeClass('active');
                $(".etapa1").addClass('active');
                $(".etapa2").addClass('active');

                $("#btnEtapaPedido").addClass('hidden')
                $("#btnEtapaEndereco").removeClass('hidden')
                $("#btnEtapaResumo").addClass('hidden')
                $("#btnVoltar").removeClass('hidden')
        }

        if(etapa == 3){
                $("#lblTituloEtapa").text("Resumo do pedido");
                $("#itensCarrinho").addClass('hidden');
                $("#localEntrega").addClass('hidden');
                $("#resumoCarrinho").removeClass('hidden');

                $(".etapa").removeClass('active');
                $(".etapa1").addClass('active');
                $(".etapa2").addClass('active');
                $(".etapa3").addClass('active');

                $("#btnEtapaPedido").addClass('hidden')
                $("#btnEtapaEndereco").addClass('hidden')
                $("#btnEtapaResumo").removeClass('hidden')
                $("#btnVoltar").removeClass('hidden')
        }
    },

    //Botao de voltar etapa
    voltarEtapa:()=>{
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);
    },



    //Carrega a lista de itens do carrinho
    carregarCarrinho:() =>{
        cardapio.metodos.carregarEtapa(1);
        if(MEU_CARRINHO.length > 0){
            $("#itensCarrinho").html('');
            $.each(MEU_CARRINHO,(i, e)=> {

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                //Ultimo item do carrinho
                if((i + 1) == MEU_CARRINHO.length){
                    cardapio.metodos.carregarValores()
                }
            })
        }else{
            $("#itensCarrinho").html(`<p class="carrinho-vazio"><i class="fas fa-shopping-cart"></i>Seu carrinho está vazio!<p/>`);
            cardapio.metodos.carregarValores()
        }
    },

    //Diminu a quantidade do item no carrinho
    dinimuirQuantidadeCarrinho:(id)=>{
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        
        if(qntdAtual > 1){
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }else{
            cardapio.metodos.removerItemCarrinho(id);
        }
    },

    //Aumenta a quantidade do item no carrinho
    aumentarQuantidadeCarrinho:(id)=>{
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
    },

    //Remove itens do carrinho
    removerItemCarrinho:(id)=>{
        MEU_CARRINHO = $.grep(MEU_CARRINHO,(e, i)=> { return e.id != id  })
        cardapio.metodos.carregarCarrinho();

        //Atualiza a badge com a qtd atualizada
        cardapio.metodos.atualizarBadgeTotal();
    },


    //Atualiza o carrinho com a quantidade atual
    atualizarCarrinho:(id, qntd) =>{
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        //Atualiza a badge com a qtd atualizada
        cardapio.metodos.atualizarBadgeTotal();

        //Atualiza os valores totais do carrinho
        cardapio.metodos.carregarValores();
    },


    //Carrega os valores de toral, subtotal e entrega
    carregarValores:()=>{
        VALOR_CARRINHO = 0;
        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');
    
    $.each( MEU_CARRINHO, (i, e) => {
        VALOR_CARRINHO += parseFloat(e.price * e.qntd);

        if((i + 1) == MEU_CARRINHO.length){
            $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.',',')}`);
            $("#lblValorEntrega").text(`R$ ${VALOR_ENTREGA.toFixed(2).replace('.',',')}`);
            $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}`);
        }

    })
    
    },

    //Carregar a etapa endereços
    carregarEndereco:() =>{
        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem('Seu carrinho esta vazio !')
            return;
        }cardapio.metodos.carregarEtapa(2);
    },


    //Busca CEP via api viaCEP
    buscarCEP:() => {
        //Variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g,'');

        if(cep != ""){
            var  validaCEP = /^[0-9]{8}$/;

            if(validaCEP.test(cep)){
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados){

                       if(!("erro" in dados)){
                            //Atualizar os campos com os valores retornados
                            $("#txtEndereco").val(dados.logradouro);
                            $("#txtBairro").val(dados.bairro);
                            $("#txtCidade").val(dados.localidade);
                            $("#ddlUf").val(dados.uf);
                            $("#txtNumero").focus();
                       }else{
                        cardapio.metodos.mensagem("CEP não encontrado, Preencha as informações manualmente."); 
                        $("#txtEndereco").focus(); 
                       }
                })

            }else{
                cardapio.metodos.mensagem("CEP está incorreto.");
                $("#txtCEP").focus();
            }
        }else{
            cardapio.metodos.mensagem('Necessario informa o CEP!');
            $("#txtCEP").focus();
        }

    },


    //Validação antes de seguir com a etapa 3
    resumoPedido:() =>{
      let cep =  $("#txtCEP").val().trim();
      let endereco = $("#txtEndereco").val().trim();
      let bairro =  $("#txtBairro").val().trim();
      let cidade =  $("#txtCidade").val().trim();
      let uf = $("#ddlUf").val().trim();
      let numero =  $("#txtNumero").val().trim();
      let complemento =  $("#txtComplemento").val().trim();

        if(cep.length <= 0){
            cardapio.metodos.mensagem("Informe o CEP, por favor");
            $("#txtCEP").focus();
            return
        }

        if(endereco.length <= 0){
            cardapio.metodos.mensagem("Informe o endereço, por favor");
            $("#txtEndereco").focus();
            return
        }

        if(bairro.length <= 0){
            cardapio.metodos.mensagem("Informe o bairro, por favor");
            $("#txtBairro").focus();
            return
        }

        if(cidade.length <= 0){
            cardapio.metodos.mensagem("Informe a  cidade, por favor");
            $("#txtCidade").focus();
            return
        }

        
        if(uf == -1){
            cardapio.metodos.mensagem("Informe a UF, por favor");
            $("#ddlUf").focus();
            return
        }

        
        
        if(numero.length <= 0){
            cardapio.metodos.mensagem("Informe o número, por favor");
            $("#txtNumero").focus();
            return
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento

        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },


    //carrega a lista dos itens e local da entrega do pedido
    carregarResumo:() =>{
        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) =>{

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);
        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero},${MEU_ENDERECO.bairro}`)
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade},${MEU_ENDERECO.uf},${MEU_ENDERECO.complemento} - ${MEU_ENDERECO.cep}`);

        cardapio.metodos.finalizarPedido();
       cardapio.metodos.mensagem('Apos clicar em Enviar pedido o WhatsApp será aberto. ','green')
    
    },

    


    //Carrega o botão do whatsapp
    finalizarPedido:() =>{
        if(MEU_CARRINHO.length > 0 && MEU_CARRINHO != null){

            var texto = 'Olá gostaria de fazer um pedido: ';
            texto += `\n*Itens do pedido:*\n\n\${itens}`
            texto += '\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero},${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}, ${MEU_ENDERECO.uf}, ${MEU_ENDERECO.complemento} - ${MEU_ENDERECO.cep}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}*`;
            
            var itens = '';

            $.each(MEU_CARRINHO,(i,e) =>{
                itens += `*${e.qntd}x* ${e.name}....... R$${e.price.toFixed(2).replace('.',',')} \n`;

                //Ultimo item
                if((i + 1)== MEU_CARRINHO.length){
                        texto = texto.replace(/\${itens}/g, itens);
                }

                //Converte a URL para enviar para whatsapp
                let encode = encodeURI(texto);
                let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`

                
                $("#btnEtapaResumo").on('click', function() {
                    window.open(URL, '_blank');
                    cardapio.metodos.mensagem('Finalize o pedido pelo WhatsApp','green');
                    setTimeout(()=>{
                        location.reload(); // Recarrega a página quando o botão é clicado
                    },9000)
                });
                
            })
        }
    },


    //Carrega o link do botão reserva
    carregarBotaoReserva: () =>{
        var texto = "Olá, Gostaria de fazer uma *reserva*"

        let encode = encodeURI(texto);
        let URL =`https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $('#btnReserva').attr('href',URL)
    },

    //abre o whatsapp para converssar
    carregaWhatsappConverda:() =>{
        var texto = "Olá, gostaria de conhecer o restaurante."

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
        
        $('#abrirWhatsapp').attr('href',URL)

    },



    abrirDepoimento:(depoimento)=>{
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');


    },


        
    carregarBotaoLigar:()=>{
        $('btnLigar').attr('href',`tel:${CELULAR_EMPRESA}`)
    },

   


    
    //Tamplete de mensagem
    mensagem: (texto, cor = 'red', tempo = 3500) =>{

        let id = Math.floor(Date.now() * Math.random()).toString();//Criando ID que nao se repita e aleatorio
        
        let msg = `<div id="msg-${id}" class="animated bounceInDown toast ${cor}">${texto}</div>`;
        
    
        $("#container-mensagens").append(msg);

        //removendo a mensagem
        setTimeout(()=> {
            $("#msg-" + id).removeClass('fadeInDown')
            $("#msg-" + id).addClass('fadeOutUp')
          setTimeout(() => {
            $("#msg-" + id).remove(); 
          },800)
        },tempo)

    },

}

cardapio.templates = {
    item:`
    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
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
    `,
    itemCarrinho:`
    <div class="col-12 item-carrinho">
    <div class="img-produto">
        <img src="\${img}">
    </div>
    <div class="dados-produto">
        <p class="title-produto"><b>\${name}</b></p>
        <p class="price-produto"><b>R$ \${price}</b></p>
    </div>
    <div class="add-carrinho">
        <span class="btn-menos" onclick="cardapio.metodos.dinimuirQuantidadeCarrinho('\${id}')"><i class="fa fa-minus"></i></span>
        <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
        <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fa fa-plus"></i></span>
        <span class="btn btn-remove"  onclick="cardapio.metodos.removerItemCarrinho('\${id')"}></span>
    </div>
</div><!--item-carrinho-->
`,
    itemResumo:`
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}">
        </div>
        <div class="dados-produto">
            <p class="title-produto-resumo">
                <b>\${name}</b>
            </p>
            <p class="price-produto-resumo">
                <b>R$ \${price}</b>
            </p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qntd}</b>
        </p>
    </div>`

}