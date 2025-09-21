import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  resetFilters,
} from '../../redux/slices/FilterSlice';
import { resetCategory } from '../../redux/slices/CategorySlice';
import logo from "../../../src/public/images/souq-logo.png"

const Logo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(resetFilters());
    dispatch(resetCategory());
  };

  return (
    <Link to="/" className="flex items-center gap-1" onClick={handleClick}>
      <img src={logo} alt="Souq Logo" className="h-8 w-auto" />
      <span className="text-xl font-bold text-teal-600">{t("souq")}</span>
    </Link>
  );
};

export default Logo;
