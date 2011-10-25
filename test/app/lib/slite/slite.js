var slite = require('../../../../app/lib/slite/slite');
exports['delegate'] = function(assert){
	assert.eql(slite.delegate({url: '/'            })  true);		// Default path found
	assert.eql(slite.delegate({url: '/?foo=bar'    })  true);
	assert.eql(slite.delegate({url: '/?foo=bar#baz'})  true);
	assert.eql(slite.delegate({url: '/shop'        }), true);
	assert.eql(slite.delegate({url: '/shop/'       }), true);
	assert.eql(slite.delegate({url: '/nonexistent' }), true);
};
