const { Router } = require("express");
const mysql = require("mysql2/promise");
const router = Router();
const webpush = require("../webpush");

router.post("/subscription", async (req, res) => {
  const pushSubscripton = req.body;
  const connection = await mysql.createConnection({
    host: "198.27.127.208",
    user: "extremao_notificaciones-web",
    password: "]nHh&u+Um[h_",
    database: "extremao_notificaciones-web",
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
  });

  console.log(pushSubscripton);

  const data = {
    endpoint: pushSubscripton.subscription.endpoint,
    expirationTime: pushSubscripton.subscription.expirationTime,
    keys: {
      p256dh: pushSubscripton.subscription.keys.p256dh,
      auth: pushSubscripton.subscription.keys.auth,
    },
  };

  const [
    rows,
    fields,
  ] = await connection.execute(
    "select * from notification_suscribe where project = ? and id_user = ? and p256dh = ? and auth = ?",
    [
      pushSubscripton.info.project,
      pushSubscripton.info.idUser,
      pushSubscripton.subscription.keys.p256dh,
      pushSubscripton.subscription.keys.auth,
    ]
  );

  if (rows.length > 0) {
    res.status(400).json({ message: "ya existe la suscribcion" });
  } else {
    res.status(200).json(pushSubscripton);
      connection.execute(
      `INSERT INTO notification_suscribe (project,id_user,name,asunto, data, endpoint, p256dh, auth ) VALUES (?, ?, ?, ? ,?, ?, ?, ?)`,
      [
        pushSubscripton.info.project,
        pushSubscripton.info.idUser,
        "",
        "",
        JSON.stringify(data),
        pushSubscripton.subscription.endpoint,
        pushSubscripton.subscription.keys.p256dh,
        pushSubscripton.subscription.keys.auth,
      ]
    );
  }
});

router.post("/new-message", async (req, res) => {
  const data = req.body;
  try {
    const connection = await mysql.createConnection({
      host: "198.27.127.208",
      user: "extremao_notificaciones-web",
      password: "]nHh&u+Um[h_",
      database: "extremao_notificaciones-web",
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0,
    });

    const [
      rows,
      fields,
    ] = await connection.execute(
      "select * from notification_suscribe where project = ? and id_user = ?",
      [data.project, data.idUser]
    );
    if (rows.length > 0) {
      res.status(200).json({ title: data.title, message: data.message });
      rows.map((value) => {
        webpush
          .sendNotification(
            JSON.parse(value.data),
            JSON.stringify({ title: data.title, message: data.message })
          )
          .catch(function (ex) {
            console.log("Notification", value);
            console.log("Notification error", ex);
            connection.execute(
              "delete from notification_suscribe where project = ? and id_user = ? and p256dh = ? and auth = ?",
              [value.project, value.id_user, value.p256dh, value.auth]
            );
          });
      });
    } else {
      res
        .status(400)
        .json({ message: "No existe usuario para enviar notificacion" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
