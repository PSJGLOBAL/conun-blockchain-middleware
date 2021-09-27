(() => {
    let data = {
        removed: false,
        logIndex: 3,
        transactionIndex: 10,
        transactionHash: '0x37ac1c7035f408f2e9865dfb6f59a71edeab202b4084e7c663c832b4f4ce0abe',
        blockHash: '0x836140cf21f8560e2b967266c58a62f11f63325634401831bd38d3502f19026d',
        blockNumber: 11097998,
        address: '0x8f06274e9a8EeB096DEA0b96084063107bdB1A57',
        id: 'log_ae53072f',
        returnValues: {
          '0': '0x39A98cfE183bA67aC37D4b237aC2bf504314A1E9',
          '1': '0x47fc465a0511f289ea38c5a04e82030590b442d34e003eb191747507675fb1aa',
          '2': '10000000000000000',
          from: '0x39A98cfE183bA67aC37D4b237aC2bf504314A1E9',
          swapID: '0x47fc465a0511f289ea38c5a04e82030590b442d34e003eb191747507675fb1aa',
          amount: '10000000000000000'
        },
        event: 'NewDeposit',
        signature: '0x1d5301fc00ef3fd9540a0cf38e456eded9696ad0a68a195a8aeec02d1d9ff596',
        raw: {
          data: '0x',
          topics: [
            '0x1d5301fc00ef3fd9540a0cf38e456eded9696ad0a68a195a8aeec02d1d9ff596',
            '0x00000000000000000000000039a98cfe183ba67ac37d4b237ac2bf504314a1e9',
            '0x47fc465a0511f289ea38c5a04e82030590b442d34e003eb191747507675fb1aa',
            '0x000000000000000000000000000000000000000000000000002386f26fc10000'
          ]
        }
      }

    let invoke = {
        queryData: {
          removed: false,
          logIndex: 3,
          transactionIndex: 10,
          transactionHash: '0x37ac1c7035f408f2e9865dfb6f59a71edeab202b4084e7c663c832b4f4ce0abe',
          blockHash: '0x836140cf21f8560e2b967266c58a62f11f63325634401831bd38d3502f19026d',
          blockNumber: 11097998,
          address: '0x8f06274e9a8EeB096DEA0b96084063107bdB1A57',
          id: 'log_ae53072f',
          returnValues: {
            '0': '0x39A98cfE183bA67aC37D4b237aC2bf504314A1E9',
            '1': '0x0c958b8251761b0e7527cc10458b902a5fae476ea9619fa1429edb2693bdea79',
            '2': '10000000000000000',
            from: '0x39A98cfE183bA67aC37D4b237aC2bf504314A1E9',
            swapID: '0x0c958b8251761b0e7527cc10458b902a5fae476ea9619fa1429edb2693bdea79',
            amount: ''
          },
          event: 'NewDeposit',
          signature: '0x1d5301fc00ef3fd9540a0cf38e456eded9696ad0a68a195a8aeec02d1d9ff596',
          raw: { data: '0x', topics: [Array] }
        },
        user: {
          swaps: [],
          _id: '614be5bae3fdd646d02582f2',
          orgName: 'Org1',
          password: '$2b$10$1.Cl2Fzub3HUHcgJZYCEOuy4Egh8lZbwB0YlyuahXpXlW3laps6nW',
          walletAddress: '0x39a98cfe183ba67ac37d4b237ac2bf504314a1e9',
          x509keyStore: '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',
          walletSignature: '0x0e40e8fdd979754d5a5614cc44d416926ee709b349fa132d435d1b41fb431ed67e1ccdec74c9d379f10b4c16fcc97611ecd2227d77eaadafc937d157ccb0988a1b',
          isAdmin: true,
          createdAt: '2021-08-27T05:20:46.630Z',
          __v: 43
        },
        swap: {
          _id: '614da134a5378667dc3975b6',
          swapType: 'CONtoCONX',
          wallet: '614be5bae3fdd646d02582f2',
          amount: '10',
          swapID: '0x0c958b8251761b0e7527cc10458b902a5fae476ea9619fa1429edb2693bdea79',
          swapKey: '0x268fb699a83f56ee2a176f2fe8016a6516989beca2e40d8de57e8feef81c321b',
          messageHash: '0x99fa8155ccd80af12abda5615df638829018bf4283fefd0b7bb1cfe75e347fbb',
          signature: '0xb99a5d30e8ae156af4fa2020ac8a86e79ad6df3177a3b7037e1419f8a17c0fc7710c023ce51c3f7c797a1858f79b5cfbdbfbc18c1f5c16dcfe139b6283228f9c1c',
          createdAt: '2021-09-24T09:58:12.746Z',
          __v: 0
        },
        ethereumTx: {
          _id: '614da134a5378667dc3975b6',
          swapType: 'CONtoCONX',
          wallet: '614be5bae3fdd646d02582f2',
          amount: '10',
          swapID: '0x0c958b8251761b0e7527cc10458b902a5fae476ea9619fa1429edb2693bdea79',
          swapKey: '0x268fb699a83f56ee2a176f2fe8016a6516989beca2e40d8de57e8feef81c321b',
          messageHash: '0x99fa8155ccd80af12abda5615df638829018bf4283fefd0b7bb1cfe75e347fbb',
          signature: '0xb99a5d30e8ae156af4fa2020ac8a86e79ad6df3177a3b7037e1419f8a17c0fc7710c023ce51c3f7c797a1858f79b5cfbdbfbc18c1f5c16dcfe139b6283228f9c1c',
          createdAt: '2021-09-24T09:58:12.746Z',
          __v: 0,
          ethereumTx: '0x37ac1c7035f408f2e9865dfb6f59a71edeab202b4084e7c663c832b4f4ce0abe',
          isComplited: false
        }
      }

      etherEvent.querySwapID(data)
      etherEvent.swapCONX(invoke)
      .catch((error) => {
          console.log('swapCONX-> error: ', error)
      })
})()