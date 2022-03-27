import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { Social } from "../target/types/social";
const { PublicKey } = anchor.web3;

describe("social", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Social as Program<Social>;

  it("Is initialized!", async () => {
    // Add your test here.
    const authority = program.provider.wallet.publicKey;
    const [user, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"),authority.toBuffer()],
      program.programId
    );
    console.log("USERu " + user)    
    console.log(`user bump: ${bump}`)
    const tx = await program.methods.createUser("My User").accounts({
        user,
        authority,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    console.log("Your transaction signature", tx);

  });

  it("Can not re-create user", async () => {
    const authority = program.provider.wallet.publicKey;
    const [user, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"),authority.toBuffer()],
      program.programId
    );
    try{
    const tx = await program.rpc.createUser("My User", {
      accounts: {
        user,
        authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });
    console.log("Your transaction signature", tx);        
  } catch (e) {
    assert.ok(String(e).startsWith("Error: failed to send transaction"))
  }
  })

  it("Can create user month accounts", async () => {
    const authority = program.provider.wallet.publicKey;
    const [user, _bump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"),authority.toBuffer()],
      program.programId
    );
    console.log("RECOVERED: "+ user)
    const date = new Date();
    const [userMonth, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user_month"),
        authority.toBuffer(),
        //Buffer.from("2022")
      ],
      program.programId
    );
    const tx = await program.methods
    .createUserMonth(
      {
        year: 2022,
        month: 3,
        yearstr: "2022"
      }
      )
    .accounts({
      userMonth:userMonth,
      authority:authority,
      //user:user,
      systemProgram: anchor.web3.SystemProgram.programId
    }
    ).rpc()
    console.log("Made call")
    const um = await program.account.userMonth.fetch(userMonth);
    console.log("Fetched userMonth")
    console.log(um)
    console.log(date.getFullYear())
  })

});
