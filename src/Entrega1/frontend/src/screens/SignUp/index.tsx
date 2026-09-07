import { Button } from '../../components/Button';
import { FormTextField } from '../../components/FormTextField';
import { LogoMark } from '../../components/LogoMark';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { useSignUp } from '../../hooks/useSignUp';
import {
  Content,
  FooterAction,
  FooterPrompt,
  FormError,
  Heading,
  Spacer,
  Subheading,
} from '../shared/authStyles';
import { Brand, Fields, Intro, LogoRow, TermsNotice } from './styles';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

export function SignUpScreen({ onNavigateToLogin }: SignUpScreenProps) {
  const { form, submit, formError, submitting } = useSignUp();

  return (
    <Screen edges={['top', 'bottom']}>
      <Content>
        <LogoRow>
          <LogoMark />
        </LogoRow>
        <Brand>{texts.brand}</Brand>

        <Intro>
          <Heading>{texts.signUp.heading}</Heading>
          <Subheading>{texts.signUp.subheading}</Subheading>
        </Intro>

        <Fields>
          <FormTextField
            control={form.control}
            name="name"
            placeholder={texts.signUp.name}
            autoCapitalize="words"
            autoComplete="name"
          />
          <FormTextField
            control={form.control}
            name="email"
            placeholder={texts.signUp.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField
            control={form.control}
            name="password"
            placeholder={texts.signUp.password}
            secureTextEntry
            autoCapitalize="none"
          />
        </Fields>

        {formError ? <FormError>{formError}</FormError> : null}

        <Button
          label={submitting ? texts.signUp.submitting : texts.signUp.submit}
          onPress={submit}
          disabled={submitting}
        />

        <TermsNotice>{texts.signUp.terms}</TermsNotice>

        <Spacer />

        <FooterPrompt>
          {texts.signUp.footerPrompt}
          <FooterAction onPress={onNavigateToLogin}>{texts.signUp.footerAction}</FooterAction>
        </FooterPrompt>
      </Content>
    </Screen>
  );
}
