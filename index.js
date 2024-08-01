const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session); //iniciar a file store, dizendo que eu quero salvar as secões na pasta session
const flash = require("express-flash");
//inicialização express
const app = express();

//import da conexão com o banco
const conn = require("./db/conn");

//MODELS
const Tought = require("./models/Tought");
const User = require("./models/User");

//importando as rotas dos pensamentos
const toughtsRoutes = require("./routes/toughtsRoutes");
const authRoutes = require("./routes/authRoutes");

//import do controller
const ToughtController = require("./controllers/ToughtController");

//templete engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

//receber respostas do body
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json()); //middleware que nos ajuda a ler json

//session middleware
app.use(
  session({
    name: "session",
    secret: "nosso_secret", //para ficar 'incebrável' protegendo as secões dos usuários
    resave: false, //caiu a seção ele desconeta
    saveUninitialized: false,
    //onde eu vou salver a seção
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"), //caminho para eu salvar os arquivos da seção
    }),
    cookie: {
      secure: false,
      maxAge: 360000, //tempo de duração do cookie, neste caso é de 1 dia
      expires: new Date(Date.now() + 360000), // expirando o cookie automáticamente em um dia
      httpOnly: true,
    },
  })
);

//flash messages
app.use(flash());

//arquivos publicos / assets
app.use(express.static("public"));

//salvando a seção para a resposta
app.use((req, res, next) => {
  //caso o user esteja logado, salvamos os dados do usuário passando ele para a resposta
  if (req.session.userId) {
    res.locals.session = req.session;
  }
  //caso o user nao esteja logado o if passa em branco e seguimos
  next();
});

//ROUTES
app.use("/toughts", toughtsRoutes);
app.use("/", authRoutes);
app.get("/", ToughtController.showToughts); //vou utilizar o toughts controller para exibir todos o pensamentos na rota /, ou seja para exibir a mesma coisa que na rota /toughts

const PORT = process.env.PORT || 3000;
conn
  //.sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
