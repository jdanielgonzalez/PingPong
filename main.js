//main principal

//funcion para crear el tablero
(function (){ 
    //contrutor del tablero
    self.Board = function(width,height) 
    {
        this.width=width;
        this.height=height;
        this.playing=false;
        this.game_over=false;
        this.bars=[];
        this.ball=null;
        this.playing=false;
    }
    //contruyo el prototipo con sus metodos
    self.Board.prototype = 
    {
        get elements()
        {
            let elements = this.bars.map(function(bar){ return bar;});
            elements.push(this.ball);
            return elements;
        }
    }
})();

//funcion que crea la pelota
(function(){
    //constructor de la pelota
    self.Ball = function(x,y,radius,board){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.speed_y=0;
        this.speed_x=3;
        this.board= board;
        this.direction=-1;
        this.bounce_angle=0;
        this.max_bounce_angle=Math.PI/6;
        this.speed=3;
        board.ball=this;
        this.kind="circle";
    }    

    //construyo el prototipo con sus metodos
    self.Ball.prototype ={
        //funcion que mueve la pelota
        move: function()
        {
            this.x+=(this.speed_x*this.direction);
            this.y+=(this.speed_y);

            //condicion que hace que rebote en el borde inferior
            if(this.y>(this.board.height-5))
            {
                this.speed_y = -1*this.speed_y;
            }
            //condicion que hace que rebote en el borde superior
            if(this.y<=5)
            {
                this.speed_y = -1*this.speed_y;
            }
        },

        //funcion que devuelve el diametro
        get width()
        {
            return this.radius*2;
        },

        //funcion que devuelve el diametro
        get height()
        {
            return this.radius*2;
        },

        //funcion que se encarga de las colisiones
        collision: function(bar)
        {
            //reacciona a la colision con una barra que recibe como parametro
            let relative_intersect_y = (bar.y+(bar.height / 2))-this.y;
            let normalized_intersect_y = relative_intersect_y /(bar.height / 2);
            this.bounce_angle = normalized_intersect_y*this.max_bounce_angle;

            this.speed_y=this.speed * -Math.sin(this.bounce_angle);
            this.speed_x=this.speed * Math.cos(this.bounce_angle);
            
            //condicion que se encarga de hacer el rebote con las barras
            if(this.x>(this.board.width / 2))
            {
                this.direction=-1;
            }
            else
            {
                this.direction =1;
            }
        }
    
    }
}());

//funcion de las barras
(function(){
    //constructor de las barras
    self.Bar = function(x,y,width,height,board) {
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.board=board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 10;     
    }

    //contruyo el prototipo con sus metodos
    self.Bar.prototype = {
        //funcion para subir la barra
        down: function(){
            this.y += this.speed;
        },
        //funcion para bajar la barra
        up: function() {    
            this.y -= this.speed;   
        }

    }
})();

//mostrar el tablero
(function (){
    //constructor
        self.BoardView = function(canvas,board) {
        this.canvas = canvas;
        this.canvas.width=board.width;
        this.canvas.height=board.height;
        this.board=board;
        this.ctx=canvas.getContext("2d");
    }
    //protipo con su metodos
     self.BoardView.prototype = {
         //funcion limpiar
         clean: function(){
             this.ctx.clearRect(0,0,this.board.width,this.board.height);
         },
         //dibujar
         draw: function(){
             for(let i=this.board.elements.length-1;i>=0;i--)
             {
                let el = this.board.elements[i];

                draw(this.ctx,el);
             };
         },
         //chequear colisiones
         check_collisions: function()
         {
            for(let i = this.board.bars.length-1;i>=0;i--)
            {
                let bar = this.board.bars[i];
                if(hit(bar,this.board.ball)){
                    this.board.ball.collision(bar);
                }
            }
         },
         
         //funcion que realiza la parte de jugabilidad
         play: function()
         {
             if(this.board.playing)
             {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
             }
         }
     }

     //funcion que revisa si hubo alguna colision
     function hit(a,b){
         let hit =false;
        //colisiones horizontales
         if(b.x + b.width >=a.x && b.x < a.x+a.width)
        {
            //colisiones verticales
            if(b.y+b.height >= a.y && b.y < a.y+a.height)
            {
                hit = true;
            }
        }
        //colision de a con b
        if(b.x <= a.x && b.x+b.width >= a.x +a.width)
        {
            if(b.y <= a.y && b.y+b.height >= a.y+a.height)
            {
                hit=true;
            }
        }
        //colision b con a
        if(a.x <=b.x && a.x +a.width >= b.x+b.width)
        {
            if(a.y<=b.y && a.y+a.height>=b.y+b.height)
            hit=true;
        }
        return hit;
     }

    //funcion que dibuja los elementos en pantalla
    function draw(ctx,element){
        switch(element.kind) 
        {
            //barras
            case "rectangle":
                ctx.fillRect(element.x,element.y,element.width,element.height);
                break;
            //pelota
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x,element.y,element.radius,0,7);
                ctx.fill();
                ctx.closePath();
                break;
        }       
    
        
    }
})();

//inicializacion de variables
let board = new Board(800,400); //tablero
let bar1 = new Bar(20,100,40,100,board); //barra de la derecha
let bar2 = new Bar(735,100,40,100,board); //barra de la izquierda
let canvas = document.getElementById('canvas'); //canvas o seccion de la pagina web
let board_view = new BoardView(canvas,board); //visualizacion del tablero
let ball = new Ball(350,100,10,board); //pelota

// se aggrega un Eventlistener para cuando se precione una tecla
document.addEventListener("keydown",function(ev){
    //tecla arriba
    if(ev.keyCode===38)
    {
        ev.preventDefault();
        bar2.up();
    }
    //tecla abajo
    else if(ev.keyCode ===40)
    {
        ev.preventDefault();
        bar2.down();
    }
    //tecla s
    else if(ev.keyCode ===87)
    {
        ev.preventDefault();
        bar1.up();
    }
    //tecla w
    else if(ev.keyCode ===83)
    {
        ev.preventDefault();
        bar1.down();
    }
    else if(ev.keyCode ===32)
    {
        ev.preventDefault();
        board.playing=!board.playing;
    }
});

//se dibuja pro primera vez el tablero
board_view.draw();
//se actualzia el juego cada frame
window.requestAnimationFrame(controller);

//funcion que se ejecuta con cada frame
function controller() 
{
    board_view.play();
    window.requestAnimationFrame(controller);
}