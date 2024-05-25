import React, { FC, memo } from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Select,
  Text,
} from '@chakra-ui/react';

type SelectLabelProps = {
  options: { [key: string]: string }[] | [];
  valueLabel: string;
  nameLabel: string;
  labelName: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  value: string;
  name?: string;
  placeholder?: string;
  isRequired?: boolean;
  formHelperText?: string;
  formErrorMessage?: string;
  isInvalid?: boolean;
};

const SelectLabel: FC<SelectLabelProps> = ({
  name,
  options,
  labelName,
  valueLabel,
  nameLabel,
  onChange,
  value,
  placeholder,
  isRequired,
  formHelperText,
  formErrorMessage,
  isInvalid,
}) => {
  return (
    <FormControl isInvalid={isInvalid}>
      <FormLabel fontWeight="bold" mb={4} lineHeight="20px" fontSize="14px" color="#222">
        {labelName}
        {isRequired && (
          <Text as="span" color="#222">
            {' '}
            *
          </Text>
        )}
      </FormLabel>
      <Select onChange={onChange} value={value} name={name} placeholder={placeholder}>
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option, index) => (
          <option key={index} value={option[valueLabel]}>
            {option[nameLabel]}
          </option>
        ))}
      </Select>
      {!isInvalid && formHelperText && (
        <FormHelperText fontWeight="normal" color="#5b5b5b" mt={4}>
          {formHelperText}
        </FormHelperText>
      )}
      {isInvalid && formErrorMessage && (
        <FormErrorMessage color="#DF1414" fontWeight="normal" mt={4}>
          {formErrorMessage}
        </FormErrorMessage>
      )}
    </FormControl>
  );
};

export default memo(SelectLabel);
