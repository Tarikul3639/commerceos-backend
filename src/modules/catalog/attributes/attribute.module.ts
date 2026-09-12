import { Module } from '@nestjs/common';

import { AttributeController } from './controllers/attribute.controller';
import { AttributeValueController } from './controllers/attribute-value.controller';

// Attribute Services
import { CreateAttributeService } from './services/create-attribute.service';
import { GetAttributeService } from './services/get-attribute.service';
import { GetAttributesService } from './services/get-attributes.service';
import { UpdateAttributeService } from './services/update-attribute.service';
import { DeleteAttributeService } from './services/delete-attribute.service';

// Attribute Value Services
import { CreateAttributeValueService } from './services/create-attribute-value.service';
import { UpdateAttributeValueService } from './services/update-attribute-value.service';
import { DeleteAttributeValueService } from './services/delete-attribute-value.service';

@Module({
    controllers: [
        AttributeController,
        AttributeValueController,
    ],

    providers: [
        // Attribute Services
        CreateAttributeService,
        GetAttributeService,
        GetAttributesService,
        UpdateAttributeService,
        DeleteAttributeService,

        // Attribute Value Services
        CreateAttributeValueService,
        UpdateAttributeValueService,
        DeleteAttributeValueService,
    ],

    exports: [
        CreateAttributeService,
        GetAttributeService,
        GetAttributesService,
    ],
})
export class AttributeModule { }