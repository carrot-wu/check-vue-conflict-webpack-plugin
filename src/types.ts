import { Module } from 'webpack';

export interface VueTemplateModule extends Module {
  resource?: string;
  _source: {
    _value: string;
  };
  userRequest?: string;
}
