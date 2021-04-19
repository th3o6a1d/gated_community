const ERC721 = artifacts.require("GatedCommunity");
contract('ERC721', (accounts) => {
    it('get name of ERC721', async () => {
        const ERC721Instance = await ERC721.deployed();
        var name;
        name = await ERC721Instance.name.call();
        console.log(name)
        // Write an assertion below to check the return value of RequestMessage.
        assert.equal('GatedCommunity', name, 'A correctness property about RequestMessage of ERC721');
    });
});