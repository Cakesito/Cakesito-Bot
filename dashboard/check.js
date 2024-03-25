const { object, string, number, array, boolean, mixed } = require('yup');

var max = 1_000_000;
let info;

async function validate (options, db) {
    var validOptions = ['daily', 'claim', 'work', 'crime', 'explore', 'craft.items', 'materials', 'shop.items', 'prefix', 'convertion'];
    var requiresUpdate = ['craft.items', 'shop.items'];
    if (!validOptions.includes(options.setting)) return { valid: false, parsed: {}, err: ['invalid setting type'] };

    try {
        info = db;
	    const parsed = validations[options.setting].cast(options.data);
	    validations[options.setting].validateSync(options.data, { abortEarly: false });
        
        return { valid: true, parsed: parsed, err: ["Cambios guardados"], requiresUpdate: requiresUpdate.includes(options.setting) };
    } catch(err) {
	    if (!err.errors) console.error(err);
        return { valid: false, parsed: {}, err: err.errors ?? ["Error desconocido"], requiresUpdate: false };
    }
}

const validations = {
    'prefix': string().required().min(1).max(20),

    'convertion': object({
        emoji: string().optional().max(max),
        name: string().optional().max(max)
    }).required().noUnknown(),

    'daily': object({
        txt: string().optional().max(2000),
        reward: object().shape({
            type: string().required().oneOf(['cash', 'inv.']),
    
            amount: number().when('type', {
                is: 'cash',
                then: () => number().required().min(0).max(max)
            }),

            materials: array().when('type', {
                is: 'inv.',
                then: () => array().required().max(2).of(object({
                    ref_id: number().required().min(0).max(19).integer().required().test({
                        test: (value) => {
                            const obj = info.craft.items.find(x => x.id === value) || info.materials.find(x => x.id === value);
                            return obj ? true : false;
                        },
                        message: "invalid object or material"
                    }),
                    amount: array().required().min(2).max(2).of(number().min(0).max(max).integer()).test({
                        test: (value) => value[0] <= value[1],
                        message: "amount not valid"
                    })
                }).noUnknown()),
                otherwise: () => mixed().notRequired()
            })
    
        }).required().test({
            exclusive: true,
            name: 'at-least-one',
            test: (value) => value.amount !== undefined || value.materials !== undefined,
            message: "missing amount or materials"
        }).noUnknown()

    }).noUnknown(),

    'claim': object({
        txt: string().optional().max(2000),
        cooldown: number().required().min(1).integer(),
        reward: object().shape({
            type: string().required().oneOf(['cash', 'inv.']),
    
            amount: number().when('type', {
                is: 'cash',
                then: () => number().required().min(0).max(max)
            }),
            materials: array().when('type', {
                is: 'inv.',
                then: () => array().required().max(2).of(object({
                    ref_id: number().required().min(0).max(19).integer().required().test({
                        test: (value) => {
                            const obj = info.craft.items.find(x => x.id === value) || info.materials.find(x => x.id === value);
                            return obj ? true : false;
                        },
                        message: "invalid object or material"
                    }),
                    amount: array().required().min(2).max(2).of(number().min(0).max(max).integer()).test({
                        test: (value) => value[0] <= value[1],
                        message: "amount not valid"
                    })
                }).noUnknown()),
                otherwise: () => mixed().notRequired()
            })

        }).required().test({
            exclusive: true,
            name: 'at-least-one',
            test: (value) => value.amount !== undefined || value.materials !== undefined,
            message: "missing amount or materials"
        }).noUnknown()

    }).noUnknown(),

    'work': object({
        txt: array().optional().max(3).of(string().max(2000)),
        cooldown: number().required().min(1).integer(),
        min: number().required().min(0).max(max).integer(),
        max: number().required().min(0).max(max).integer()
    }).test({ test: (value) => value.min <= value.max, message: "work min is higher than max" }).noUnknown(),

    'crime': object({
        cooldown: number().required().min(1).integer().integer(),
        probability: number().required().min(0).max(100).integer(),
        
        success: object({
            min: number().required().min(0).max(max).integer(),
            max: number().required().min(0).max(max).integer(),
            txt: array().optional().max(3).of(string().max(2000))
        }).test({ test: (value) => value.min <= value.max, message: "success min is higher than max" }).noUnknown(),
    
        fail: object({
            min: number().required().min(0).max(max).integer(),
            max: number().required().min(0).max(max).integer(),
            txt: array().optional().max(3).of(string().max(2000))
        }).test({ test: (value) => value.min <= value.max, message: "fail min is higher than max" }).noUnknown()
    }).noUnknown(),

    'explore': object({
        txt: object({
            success: array().optional().max(3).of(string().max(2000)),
            fail: array().optional().max(3).of(string().max(2000))
        }).optional().noUnknown(),

        cooldown: number().required().min(1).integer(),
        maxMaterials: number().required().max(10).integer(),
        probability: number().required().min(0).max(100).integer(),
        materials: array().max(10).required().of(object({
            ref_id: number().required().min(0).max(10).integer().test({
                test: (value) => {
                    const material = info.materials.find(x => x.id === value);
                    return material ? true : false;
                }
            }),
            amount: array().min(2).max(2).of(number().min(0).max(max).integer()).required().test({
                test: (value) => value[0] <= value[1],
                message: "amount not valid"
            })
        }).noUnknown())
    }).noUnknown(),

    'craft.items': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        description: string().optional().min(1).max(100),
        probability: number().min(0).max(100).required().integer(),
        id: number().min(10).max(19).integer().required(),
        use: object({
            type: string().oneOf(['cash']).optional(),

            amount: number().when('type', {
                is: 'cash',
                then: () => number().required().min(1).max(max),
                otherwise: () => mixed().notRequired()
            })
        }).required().noUnknown(),
    
        materials: array().required().max(10).of(object({
            ref_id: number().min(0).max(10).integer().required().test({
                test: (value) => {
                    const material = info.materials.find(x => x.id === value);
                    return material ? true : false;
                },
            }),
            amount: number().min(1).max(max).integer().required()
        }).noUnknown())
    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].id == value[j].id) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated object"
    }),

    'materials': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        id: number().required().min(0).max(9).integer(),
        description: string().optional().min(1).max(100)
    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].id == value[j].id) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated material"
    }),

    'shop.items': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        description: string().optional().min(1).max(100),
        onlyOnce: boolean().optional().default(false),
    
        price: object({
            type: string().required().oneOf(['cash', 'inv.']),
            amount: number().required().min(1).max(max).integer(),
            ref_id: number().when('type', {
                is: 'inv.',
                then: () => number().required().min(10).max(19).integer().test({
                    test: (value) => {
                        const material = info.craft.items.find(x => x.id === value);
                        return material ? true : false;
                    },
                    message: "invalid object"
                })
            })

        }).required().noUnknown(),

        reward: object({
            type: string().required().oneOf(['cash', 'inv.', 'role']),
            amount: number().when('type', {
                is: (value) => value === 'cash' || value === 'inv.',
                then: () => number().required().min(0).max(max).integer(),
                otherwise: () => mixed().notRequired()
            }),
            ref_id: number().when('type', {
                is: 'inv.',
                then: () => number().required().min(10).max(19).integer().test({
                    test: (value) => {
                        const material = info.craft.items.find(x => x.id === value);
                        return material ? true : false;
                    },
                    message: "invalid object"
                }),
                otherwise: () => mixed().notRequired()
            }),
            id: number().when('type', {
                is: 'role',
                then: () => string().required(),
                otherwise: () => mixed().notRequired()
            })
        }).required().noUnknown()

    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].name == value[j].name) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated object"
    })
};

module.exports = { validate };