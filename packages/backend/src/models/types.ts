export interface IFreeTierApplicationAccount {
  address: string;
  publicKey: string;
  privateKey: string;
  passPhrase: string;
}

export interface IGatewayAAT {
  version: string;
  clientPublicKey: string;
  applicationPublicKey: string;
  applicationSignature: string;
}
