const DAOwithCoin = artifacts.require("metaLifeDAOwithCoin");
const DAOrowdfund = artifacts.require("metaLifeDAOCrowdfund");
const DAOfactory = artifacts.require("metaLifeDAOFactory");
const creator_withCoin = artifacts.require("creator_withCoin");

contract('metaLifeDAO with Coin', (accounts) => {
    zero_address = "0x0000000000000000000000000000000000000000";
    let daoCoin;
    it('should be deployed properly', async () =>{
       daoCoin = await DAOwithCoin.new("testDAO", "testURI", "test", 100, 4500, [accounts[0], accounts[1]], [1000000, 1000000]);
       assert.equal(await daoCoin.daoName.call(), "testDAO");
       assert.equal(await daoCoin.balanceOf.call(accounts[0]), 1000000);
    });
    it('should handle proposals', async () =>{
      assert.equal(await daoCoin.balanceOf.call(accounts[0]), 1000000);
      assert.equal(await daoCoin.getVotes.call(accounts[0]), 1000000);
      await daoCoin.propose(
        [daoCoin.address],
        [0],
        ['0x40c10f19000000000000000000000000538fd2884b743b3fefe8d495c95c81db9e83e58a000000000000000000000000000000000000000000000000000000000000007b'],
        'mintTO0x538fD2884b743b3FEfE8D495c95C81db9e83e58a->123',
        { from: accounts[0]});
      assert.equal(await daoCoin.proposalCounts.call(), 1);
      assert.equal(await daoCoin.proposalState.call(0), 1); //Active
      await daoCoin.castVote(
        0,1,
        { from: accounts[0]});
      assert.equal(await daoCoin.proposalState.call(0), 4); //Active
      await daoCoin.execute(
        0,
        { from: accounts[1]});
        assert.equal(await daoCoin.balanceOf.call('0x538fD2884b743b3FEfE8D495c95C81db9e83e58a'), 123);
      assert.equal(await daoCoin.proposalState.call(0), 7);
   });
})

contract('metaLifeDAOfor Crowdfunding', (accounts) => {
  zero_address = "0x0000000000000000000000000000000000000000";
  let daoCoin;
  it('should be deployed properly', async () =>{
     daoCoin = await DAOrowdfund.new("testDAO", "testURI", "test", 100, 4500, zero_address, 100000, 1, 100, accounts[0]);
     assert.equal(await daoCoin.proposalCounts.call(), 1);
     assert.equal(await daoCoin.proposalState.call(0), 1); //Active
     assert.equal(await daoCoin.fundingStatus.call(), 0);
     assert.equal(await daoCoin.goalReached.call(), false);
  });
  it('should handle crowfunding', async () =>{
    assert.equal(await daoCoin.balanceOf.call(accounts[0]), 0);
    assert.equal(await daoCoin.getVotes.call(accounts[0]), 0);
    await daoCoin.fundWithValue(
      { value: 100001, from: accounts[0]});
    assert.equal(await daoCoin.goalReached.call(), true);
    assert.equal(await daoCoin.fundingStatus.call(), 0);
    assert.equal(await daoCoin.balanceOf.call(accounts[0]), 100001);
    assert.equal(await daoCoin.getVotes.call(accounts[0]), 100001);
    assert.equal(await daoCoin.proposalState.call(0), 4); //Success
    
    await daoCoin.fundWithValue(
      { value: 400, from: accounts[0]});

      assert.equal(await daoCoin.getVotes.call(accounts[0]), 100401);
    await daoCoin.declareSuccess(
      {from: accounts[0]});
    assert.equal(await daoCoin.goalReached.call(), true);
    assert.equal(await daoCoin.fundingStatus.call(), 1);

    await daoCoin.propose(
      [daoCoin.address],
      [0],
      ['0x40c10f19000000000000000000000000538fd2884b743b3fefe8d495c95c81db9e83e58a000000000000000000000000000000000000000000000000000000000000007b'],
      'mintTO0x538fD2884b743b3FEfE8D495c95C81db9e83e58a->123',
      { from: accounts[0]});
    assert.equal(await daoCoin.proposalCounts.call(), 2);
 });
})

contract('metaLifeDAO factory', (accounts) => {
  zero_address = "0x0000000000000000000000000000000000000000";
  let daoCoin;
  it('should be deployed properly', async () =>{
     factory = await DAOfactory.new();
     creator101 = await creator_withCoin.new();
     await factory.setTokenFee(zero_address, 0, true, {from: accounts[0]});
     await factory.setDAOCreator("MetaLifeDAO:101:withCoin", creator101.address);
     /*
     pack(['string', 'string', 'string', 'uint64', 'uint256', 'address[]', 'uint256[]'],
      ["testDAO", "testURI", "test", 100, 4500, ['0x538fD2884b743b3FEfE8D495c95C81db9e83e58a'], [1000000]])
     */
     res = await factory.createWithValue("MetaLifeDAO:101:withCoin",
     '0x00000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000119400000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000077465737444414f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000077465737455524900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000474657374000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000538fd2884b743b3fefe8d495c95c81db9e83e58a000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240')
  });
})
