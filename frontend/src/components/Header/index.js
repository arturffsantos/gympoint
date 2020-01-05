import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './styles';
import sideLogo from '../../assets/images/sideLogo.png';

export default function Header() {
  return (
    <Container>
      <Link to="/">
        <img src={sideLogo} alt="" />
      </Link>
    </Container>
  );
}
