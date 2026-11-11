import { useColorScheme } from 'react-native';

const claro = {
  bg: '#F2F5F7',
  card: '#FFFFFF',
  ink: '#13212B',
  muted: '#5D6D7A',
  line: '#DCE3E8',
  accent: '#0D6B73',
  accentInk: '#FFFFFF',
  accentSoft: '#DFF0F1',
  warn: '#A86A12',
  warnSoft: '#FBF0DC',
  ok: '#1F7A45',
  okSoft: '#E2F3E8',
  bad: '#B23A2E',
  badSoft: '#F9E3E0',
};

const escuro: typeof claro = {
  bg: '#0E161C',
  card: '#17222A',
  ink: '#E7EEF3',
  muted: '#93A4B1',
  line: '#283842',
  accent: '#4FB8BF',
  accentInk: '#06282B',
  accentSoft: '#16363A',
  warn: '#E3A54A',
  warnSoft: '#3A2C14',
  ok: '#5CC58A',
  okSoft: '#15301F',
  bad: '#EF7B6E',
  badSoft: '#3A1C18',
};

export type Tema = typeof claro;

export function useTema(): Tema {
  return useColorScheme() === 'dark' ? escuro : claro;
}
