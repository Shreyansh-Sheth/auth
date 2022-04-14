import Express from "express";
import * as ethUtil from "ethereumjs-util";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = new Express();
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use(
  cors({
    origin: "*",
  })
);

class User {
  constructor(address, nonce) {
    this.address = address;
    this.nonce = nonce;
  }
}
let users = [];

app.get("/", (_, res) => {
  res.json(users);
});
app.get("/:wallet_address/nonce", (req, res) => {
  const findUser = users.find(
    (user) => user.address === req.params.wallet_address
  );
  if (!findUser) {
    const nonce = getNonce();
    users.push(new User(req.params.wallet_address, nonce));

    res.send({ nonce });
  } else {
    const nonce = findUser.nonce;
    return res.json({
      nonce,
    });
  }
});

app.post("/:user/signature", (req, res) => {
  // Get user from db
  //   User.findOne({ wallet_address: req.params.user }, (err, user) => {
  const user = users.find((user) => user.address === req.params.user);
  if (user) {
    const msg = user.nonce;
    console.log(msg);
    // Convert msg to hex string
    const msgHex = ethUtil.bufferToHex(Buffer.from(msg));

    // Check if signature is valid
    const msgBuffer = ethUtil.toBuffer(msgHex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(req.body.signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addresBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addresBuffer);

    // Check if address matches
    if (address.toLowerCase() === req.params.user.toLowerCase()) {
      // Change user nonce
      //   user.nonce = Math.floor(Math.random() * 1000000);
      users = users.map((user) =>
        user.address === req.params.user
          ? { ...user, nonce: getNonce() }
          : { ...user }
      );

      // Set jwt token
      const token = jwt.sign(
        {
          _id: user._id,
          address: user.address,
        },
        "JWT_SECRET",
        { expiresIn: "6h" }
      );
      res.status(200).json({
        success: true,
        token: `Bearer ${token}`,
        user: user,
        msg: "You are now logged in.",
      });
    } else {
      // User is not authenticated
      res.status(401).send("Invalid credentials");
    }
  } else {
    res.send("User does not exist");
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3000");
});
const getNonce = () => {
  return `
    Thanks For Using Our Website ABC.com
    This Message Allows You To Connect And Login To Our Site So You Can Play Songs
    \n
    # hello
    <h1>Hello / Welcome To ABC.com</h1>

    \n
  
  NONCE:${Math.floor(Math.random() * 1000000)}

    `;
};
