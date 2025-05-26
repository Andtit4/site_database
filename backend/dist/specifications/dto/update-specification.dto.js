"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSpecificationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_specification_dto_1 = require("./create-specification.dto");
class UpdateSpecificationDto extends (0, mapped_types_1.PartialType)(create_specification_dto_1.CreateSpecificationDto) {
}
exports.UpdateSpecificationDto = UpdateSpecificationDto;
//# sourceMappingURL=update-specification.dto.js.map